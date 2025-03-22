import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deauthUser, isAuthenticated } from "../utils/auth";
import { Button, Dropdown, Menu, Table, message } from "antd";
import { sanityClient } from "../lib/sanity/getClient";
import * as XLSX from 'xlsx';
import moment from "moment";

const columns = [
  {
    title: 'Nama Relawan',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a className='text-rose-600 font-semibold'>{text}</a>,
  },
  {
    title: 'Lokasi',
    dataIndex: 'lokasi',
    key: 'lokasi',
    render: (item, record) => (
      <div>
        {record.village}, {record.district}, {record.regency}
      </div>
    )
  },
  {
    title: 'Waktu',
    dataIndex: 'waktu',
    key: 'waktu',
    render: (item, record) => (
      <div>
        {moment(record.date).subtract(10, 'days').calendar()}
      </div>
    )
  },
  {
    title: 'Nama Kegiatan',
    dataIndex: 'namaKegiatan',
    key: 'namaKegiatan',
  },
  {
    title: 'PIC',
    dataIndex: 'pic',
    key: 'pic',
  },
  {
    title: 'Jumlah Peserta',
    dataIndex: 'jumlahPeserta',
    key: 'jumlahPeserta',
  },
  {
    title: 'Aspirasi',
    dataIndex: 'aspirasi',
    key: 'aspirasi',
  },
  {
    title: 'Keterangan',
    dataIndex: 'keterangan',
    key: 'keterangan',
  },
  {
    title: 'Foto',
    dataIndex: 'foto',
    key: 'foto',
    render: (text) => <a href={text} target="_blank" className='text-rose-600 font-semibold'>Download Foto</a>,
  },
];

function Home() {
  const navigate = useNavigate();
  const relawanRohmi_user = (localStorage.getItem('relawanRohmi_user'));

  useEffect(() => {
    // Check if the user is authenticated when the component mounts
    if (!isAuthenticated()) {
      // If not authenticated, redirect to the sign-in page
      message.error("Kamu belum login. Silahkan login terlebir dahulu!");
      navigate("/");
    }
  }, [navigate]);

  const gradientStyle = {
    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95), transparent)',
    position: 'absolute',
    inset: '0'
  };

  const menu = (
    <Menu>
      <Menu.Item key="signout" onClick={deauthUser}>Logout</Menu.Item>
    </Menu>
  );

  const [isLoading, setIsLoading] = useState(true);
  const [serverData, setServerData] = useState({
    data: [],
    error: null,
    loading: true,
  });

  useEffect(() => {
    async function fetchSanityData() {
      try {
        setIsLoading(true);
        const sanityData = await sanityClient.fetch(`*[_type == 'data-kunjungan-rohmi']{
          _id, namaKegiatan, date, province, regency, district, village, pic, jumlahPeserta, aspirasi, keterangan, fotoEksternal, "foto": foto.asset->url, geometry, user-> {name}
        }`);

        setServerData({
          data: sanityData,
          error: null,
          loading: false,
        });
      } catch (error) {
        setServerData({
          data: [],
          error: 'Error getting data. Please try again later.',
          loading: false,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSanityData();
  }, []);
  console.log('cek data pemasangan: ', serverData)

  const [dataSource, setDataSource] = useState([]);
  const [geographyData, setGeographyData] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: []
  });

  useEffect(() => {
    const initializeMap = async () => {
      const data = serverData && serverData.data && serverData.data.length > 0
        ? serverData.data.filter(item => item.user.name === relawanRohmi_user)
        : [];

      if (data.length === 0) {
        console.error('No data found');
        return;
      }

      // Extract IDs from the fetched data
      const ids = data.map(item => ({
        province: item.province,
        regency: item.regency,
        district: item.district,
        village: item.village
      }));

      // Fetch dynamic geography data based on IDs
      const { provinces, regencies, districts, villages } = await fetchGeographyData(ids);
      setGeographyData({ provinces, regencies, districts, villages });

      // Map the data to include location names
      const updatedDataSource = data.map((item) => ({
        key: item._id,
        name: item.user.name || "-",
        namaKegiatan: item.namaKegiatan || "-",
        date: item.date || "-",
        pic: item.pic || "-",
        jumlahPeserta: item.jumlahPeserta || "-",
        aspirasi: item.aspirasi || "-",
        keterangan: item.keterangan || "-",
        foto: item.fotoEksternal || "-",
        village: getNameById(item.village, villages),
        district: getNameById(item.district, districts),
        regency: getNameById(item.regency, regencies),
        province: getNameById(item.province, provinces)
      }));

      setDataSource(updatedDataSource);
    };

    initializeMap();
  }, [serverData, relawanRohmi_user]);

  // Function to fetch geography data based on IDs
  async function fetchGeographyData(ids) {
    try {
      // Fetch provinces
      const provincesResponse = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
      const provinces = await provincesResponse.json();

      // Extract unique province IDs from the provided list
      const provinceIds = [...new Set(ids.map(item => item.province))];

      // Fetch regencies for unique province IDs
      const regenciesResponses = await Promise.all(provinceIds.map(id =>
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`)
      ));
      const regenciesData = await Promise.all(regenciesResponses.map(res => res.json()));
      const regencies = regenciesData.flat();

      // Extract unique regency IDs from the list
      const regencyIds = [...new Set(ids.map(item => item.regency))];

      // Fetch districts for unique regency IDs
      const districtsResponses = await Promise.all(regencyIds.map(id =>
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`)
      ));
      const districtsData = await Promise.all(districtsResponses.map(res => res.json()));
      const districts = districtsData.flat();

      // Extract unique district IDs from the list
      const districtIds = [...new Set(ids.map(item => item.district))];

      // Fetch villages for unique district IDs
      const villagesResponses = await Promise.all(districtIds.map(id =>
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`)
      ));
      const villagesData = await Promise.all(villagesResponses.map(res => res.json()));
      const villages = villagesData.flat();

      return { provinces, regencies, districts, villages };
    } catch (error) {
      console.error('Error fetching geography data:', error);
      return { provinces: [], regencies: [], districts: [], villages: [] };
    }
  }

  // Function to get name by ID from provided list
  function getNameById(id, list) {
    const item = list.find(item => item.id === id);
    return item ? item.name : 'Not Found';
  }

  const rearrangeDataForExcel = () => {
    // Rearrange the data based on the column order
    const rearrangedData = dataSource.map((item, index) => {
      return {
        'No.': index + 1,
        'Nama Relawan': item.name,
        'Waktu': `${moment(item.date).subtract(10, 'days').calendar()}`,
        'Lokasi': `${item.village}, ${item.district}, ${item.regency}, ${item.province}`,
        'Nama Kegiatan': item.namaKegiatan,
        'PIC': item.pic,
        'Jumlah Peserta': item.jumlahPeserta,
        'Aspirasi': item.aspirasi,
        'Keterangan': item.keterangan,
        'Foto': item.foto
      };
    });
  
    return rearrangedData;
  };  

  const downloadExcel = () => {
    const data = rearrangeDataForExcel(serverData.data);
    const volunteerName = data[0]?.['Nama Relawan'];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `data-kunjungan-rohmi-${volunteerName}.xlsx`);
  };

  // const updatedColumns = columns.map((col) => ({
  //   ...col,
  //   width: col.width || 150,
  // }));
  return (
    <>
      <section id="hero" className="relative bg-[url(https://ik.imagekit.io/tvlk/blog/2021/03/Mandalika.jpg)] bg-cover bg-center bg-no-repeat">
        <div style={gradientStyle}></div>
        <div className="absolute right-0 p-6">
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="12" r="8" fill="#333" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Dropdown>
        </div>

        <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="max-w-xl text-center sm:text-left">
            <h1 className="text-3xl font-extrabold sm:text-5xl text-gray-800">
              Data Kegiatan
            </h1>

            <p className="mt-4 max-w-lg sm:text-xl/relaxed text-gray-700">
              Daftar rekap data kegiatan dan kunjungan relawan.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-center">
            <Link
                to="/home"
                className="flex justify-center items-center w-full rounded bg-rose-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-rose-700 focus:outline-none focus:ring active:bg-rose-500 sm:w-auto"
            >
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.79889 24H41.7989" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.7988 36L5.79883 24L17.7988 12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg> &nbsp; Kembali ke Home
            </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="list" className="text-gray-600 py-10 lg:px-36">
        <div className="flex justify-end mb-4 mr-2">
            <Button className="bg-green-600 text-white" onClick={downloadExcel}>Download Excel</Button>
        </div>
        <Table className='font-normal' columns={columns} dataSource={dataSource} loading={isLoading} scroll={{ x: 'max-content' }}/>

        {/* <div className="text-center mt-10">
          <a href="#hero" className="text-rose-700">Back to Top</a>
        </div> */}
      </section>
    </>
  )
}

export default Home