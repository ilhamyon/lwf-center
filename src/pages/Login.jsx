import { Button, Input, message, Popover } from "antd"
import RandomBG from "../components/RandomBG"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanity/getClient";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { v4 as uuidv4 } from "uuid";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already signed in
    const token = localStorage.getItem("lfwCenter_token");
    if (token) {
      // If signed in, redirect to "/home"
      navigate("/entry");
    }
  }, [navigate]);

  const [serverData, setServerData] = useState({
    data: [],
    error: null,
    loading: true,
  });

  useEffect(() => {
    async function fetchSanityData() {
      try {
        const sanityData = await sanityClient.fetch(`*[_type == 'user-lfw']{
          _id,
          name,
          email,
          type,
          password,
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
      }
    }

    fetchSanityData();
  }, []);
  console.log('cek data user: ', serverData)

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    // Cek apakah ada data yang cocok dengan hasil input login
    const user = serverData.data.find(
      (lfwCenter_userData) => lfwCenter_userData.email === username && lfwCenter_userData.password === password
    );

    if (user) {
      const filteredData = serverData?.data.filter(item => item._id === user._id);
      // Login berhasil
      console.log("Login berhasil:", user.name);
      message.success('Login Berhasil');
      navigate("/entry");
      // setError("");

      // Generate token
      const token = uuidv4(); // Generate token using uuid library

      // Simpan token ke dalam local storage
      localStorage.setItem("lfwCenter_token", token);
      localStorage.setItem("lfwCenter_user", user.name);
      localStorage.setItem("lfwCenter_id", user._id);
      localStorage.setItem('lfwCenter_userData', JSON.stringify(filteredData));

      // Tambahkan logika redirect atau set state untuk login di sini
    } else {
      // Tampilkan pesan error
      // setError("Username atau password salah");
      message.error("Username atau password salah");
    }
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
      <section>
        <div className="lg:flex">
          <div className="lg:w-1/2">
            <RandomBG />
          </div>
          <div className="lg:w-1/2 lg:py-0 py-10 flex items-center">
            <form className="w-full lg:px-28 px-4 items-center" onSubmit={handleLogin}>
              <h2 className="font-bold text-[18px] lg:text-4xl mb-10 text-gray-900 uppercase">Login</h2>
              <Input
                type="text"
                placeholder="Email"
                size="large"
                className="mb-4 border"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input.Password
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                size="large"
                className="mb-8 border"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                required
              />
              {/* {error && <p className="text-red-500">{error}</p>} */}
              <Button
                className="text-white bg-green-600 w-full"
                htmlType="submit"
                size="large"
              >
                Login
              </Button>
              <p className="flex justify-center text-sm font-light mt-8 text-gray-500">
                <Link to="/register" className="text-green-600"> or&nbsp;Register</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Login