import { useState, useEffect } from "react";
// import imageIqbalIndah from "/rohmi.jpg"

const RandomBG = () => {
  const [imageSrc, setImageSrc] = useState("");

  const imageList = [`https://asset-2.tstatic.net/lombok/foto/bank/images/Sekda-Lombok-Tengah-Atensi-Caleg-PAN-Terjerat-Narkoba-Usulkan-Kembali-Pembentukan-BNN-K.jpg`, `https://asset-2.tstatic.net/lombok/foto/bank/images/Sekda-Lombok-Tengah-Atensi-Caleg-PAN-Terjerat-Narkoba-Usulkan-Kembali-Pembentukan-BNN-K.jpg`];

  useEffect(() => {
    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
    setImageSrc(randomImage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {imageSrc ? (
          <img
          src={imageSrc}
          alt="best bid & quick quote"
          className="w-full lg:h-screen object-contain"
          />
      ) : null}
    </>
  );
};

export default RandomBG;
