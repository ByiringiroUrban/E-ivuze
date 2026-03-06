import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { getDoctorImageSrc } from "../utils/doctorImage";

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  // Corrected state initialization
  const [relDoc, setRelDocs] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDocs(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-800 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relDoc.length > 0 &&
          relDoc.slice(0, 5).map((item, index) => (
            <div
              onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0) }}
              className="border border-primary/20 roun-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={item._id} // Use a unique key from the item
            >
              <img className="w-full h-64 bg-gradient-to-br from-primary/10 to-primary-light/10 object-cover" src={getDoctorImageSrc(item)} alt={item?.name || 'Doctor'} />
              <div className="p-4">
              <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-primary-dark' : 'text-gray-500'} `}>
                <p className={`w-2 h-2 ${item.available ? 'bg-primary' : 'bg-gray-500'}  roun-full`}></p><p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>
                <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-primary-light text-primary-dark border border-primary/20 px-12 py-3 roun-full mt-10 hover:bg-primary hover:text-white transition-all duration-300"
      >
        More
      </button>
    </div>
  );
};

export default RelatedDoctors;
