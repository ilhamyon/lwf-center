import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { sanityClient } from "../lib/sanity/getClient";
import iconBerugak from "/icon-berugak.png"
import { Popover } from "antd";

const GISMap = () => {
  const [data, setData] = useState([]);
  const [geoData, setGeoData] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
  });
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query =
          '*[_type == "lfw-entry"]{_id, jenisKegiatan, date, province, regency, district, village, dusun, lokasiSpesifik, penanggungJawab, teleponPenanggungJawab, bentukBantuan, jumlahPeserta, keterangan, fotoEksternal, "foto": foto.asset->url, geometry, user-> {name}}';
        const result = await sanityClient.fetch(query);
        setData(result);

        // Ambil daftar ID unik untuk setiap wilayah
        const provinceIds = [...new Set(result.map((item) => item.province))];
        const regencyIds = [...new Set(result.map((item) => item.regency))];
        const districtIds = [...new Set(result.map((item) => item.district))];
        // eslint-disable-next-line no-unused-vars
        const villageIds = [...new Set(result.map((item) => item.village))];

        // Fetch data wilayah dari API
        const [provinces, regencies, districts, villages] = await Promise.all([
          fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json").then((res) => res.json()),
          Promise.all(provinceIds.map((id) => fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`).then((res) => res.json()))).then((data) => data.flat()),
          Promise.all(regencyIds.map((id) => fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`).then((res) => res.json()))).then((data) => data.flat()),
          Promise.all(districtIds.map((id) => fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`).then((res) => res.json()))).then((data) => data.flat()),
        ]);

        setGeoData({ provinces, regencies, districts, villages });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk mencari nama wilayah berdasarkan ID
  const getNameById = (id, list) => {
    if (!list) return "Not Found";
    const item = list.find((item) => String(item.id) === String(id));
    return item ? item.name : "Not Found";
  };

  const content = (
    <div>
      <p>Aplikasi ini menggambarkan titik kunjungan atau kontribusi di seluruh wilayah Lombok Tengah, misalnya beruapa kunjungan, menghadiri undangan, pemberian bantuan, baik secara langsung atau perwakilan</p>
    </div>
  );

  return (
    <>
    <div className="w-full right-0 lg:px-10 px-4 py-2 cursor-pointer bg-white shadow">
        <div className="flex justify-between items-center">
            <div className="flex justify-center gap-4 items-center">
                <img className="rounded-full w-16 h-16" src="https://i0.wp.com/radarmandalika.id/wp-content/uploads/2021/06/F-Lalu-firman-Wijaya.jpeg?w=639&ssl=1" />
                <h3 className="text-gray-800 text-xl font-semibold">GIS <span className="text-green-700">LFW Center</span></h3>
            </div>
            <div className="text-gray-500">
                <Popover content={content} trigger="click">
                    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="currentColor" d="M11.5 16.5h1V11h-1zm.5-6.923q.262 0 .439-.177t.176-.439t-.177-.438T12 8.346t-.438.177t-.177.439t.177.438t.438.177M12.003 21q-1.867 0-3.51-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709q1.643.708 2.859 1.922t1.925 2.857t.709 3.509t-.708 3.51t-1.924 2.859t-2.856 1.925t-3.509.709M12 20q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                </Popover>
            </div>
        </div>
    </div>
    <MapContainer
      center={[-8.686231, 116.106701]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds data={data} />
      {data.map((item) => (
        <Marker
          key={item._id}
          position={[item.geometry?.lat || 0, item.geometry?.lng || 0]}
          icon={L.icon({
            iconUrl: iconBerugak,
            iconSize: [30, 30],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
            <div>
              <p><strong>Nama Relawan:</strong> {item.user?.name || "N/A"}</p>
              <p>
                <strong>Lokasi: </strong>
                {[
                    item.dusun,
                    getNameById(item.village, geoData.villages),
                    getNameById(item.district, geoData.districts),
                ]
                    .filter(Boolean) // Hapus data kosong
                    .join(", ")}
              </p>
              <p><strong>Waktu:</strong> {new Date(item?.date).toLocaleDateString("id-ID")}</p>
              <p><strong>Lokasi Spesifik:</strong> {item?.lokasiSpesifik}</p>
              <p><strong>Jenis Kegiatan:</strong> {item?.jenisKegiatan}</p>
              <p><strong>Penanggung Jawab Kegiatan:</strong> {item?.penanggungJawab}</p>
              <p><strong>Tlp Penanggung Jawab Kegiatan:</strong> {item?.teleponPenanggungJawab}</p>
              <p><strong>Bentuk Bantuan:</strong> {item?.bentukBantuan}</p>
              <p><strong>Jumlah Peserta:</strong> {item?.jumlahPeserta}</p>
              <p><strong>Keterangan:</strong> {item?.keterangan}</p>
              {item?.fotoEksternal && <img src={item?.fotoEksternal} alt="Foto Kegiatan" style={{ width: "100%", height: "auto" }} />}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </>
  );
};

// Komponen untuk otomatis menyesuaikan tampilan peta dengan data yang tersedia
// eslint-disable-next-line react/prop-types
const FitBounds = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (data.length > 0) {
      // eslint-disable-next-line react/prop-types
      const bounds = L.latLngBounds(data.map((item) => [item.geometry?.lat || 0, item.geometry?.lng || 0]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
};

export default GISMap;
