import { Button, Input, Popover, Select, message } from "antd"
import RandomBG from "../components/RandomBG"
import { Link } from "react-router-dom"
import { useState } from "react";

const createSanityUser = async (lfwCenter_userData) => {
  // eslint-disable-next-line no-unused-vars
  const { Option } = Select;
  try {
    const response = await fetch(`https://ln9ujpru.api.sanity.io/v2021-03-25/data/mutate/production`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer skAdQo8vEzaH81Ah4n2X8QDNsgIfdWkJlLmbo3CbT6Nt3nW7iTLx2roYCOm9Rlp1mQV2nEEGCqf4aGSMaJx67iK5PZPe7CgmI9Lx9diRdq0ssoRzl1LhiUFXHQmKu0utxgBa1ttoKwat3KIFt2B5vskrT82ekR5B8sbSzE51VjZHy3T7Q62P`,
      },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: 'user-lfw', // Ganti dengan jenis dokumen pengguna di Sanity Anda
              name: lfwCenter_userData.name,
              email: lfwCenter_userData.email,
              password: lfwCenter_userData.password,
              type: lfwCenter_userData.type,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user in Sanity');
    }

    const data = await response.json();
    console.log('User created:', data);
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'relawan'
  });

  console.log(formData);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      // Send POST request to your Sanity backend to create a new user
      await createSanityUser(formData);

      message.success("Register berhasil.")

      // Reset the form after successful registration
      setFormData({
        name: '',
        email: '',
        password: '',
        type: 'relawan',
      });
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

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
            <form className="w-full lg:px-28 px-4 items-center" onSubmit={handleSubmit}>
              <h2 className="font-bold text-[18px] lg:text-4xl mb-10 text-gray-900 uppercase">Register</h2>
              <Input
                type="text"
                name="name"
                placeholder="Name"
                size="large"
                className="mb-4 border"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                size="large"
                className="mb-4 border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                size="large"
                className="mb-8 border"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Button
                className="text-white bg-green-600 w-full"
                htmlType="submit"
                size="large"
              >
                Register
              </Button>
              <p className="flex justify-center text-sm font-light mt-8 text-gray-500">
                <Link to="/" className="text-green-600"> or&nbsp;Login</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Register