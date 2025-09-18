import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8">
        Welcome to the Local Health Connect
      </h1>

      {/* Role-based Links */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Patient role: View Doctors and Pharmacies */}
        {role === "patient" && (
          <>
            <Link
              to="/doctors"
              className="bg-green-500 text-white p-6 rounded-xl text-center shadow hover:bg-green-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Doctors
            </Link>
            <Link
              to="/pharmacies"
              className="bg-blue-500 text-white p-6 rounded-xl text-center shadow hover:bg-blue-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Pharmacies
            </Link>
          </>
        )}
        {/* Doctor role: View Patients and Appointments */}
        {role === "doctor" && (
          <>
            <Link
              to="/patients"
              className="bg-purple-500 text-white p-6 rounded-xl text-center shadow hover:bg-purple-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Patients
            </Link>
            <Link
              to="/appointments"
              className="bg-orange-500 text-white p-6 rounded-xl text-center shadow hover:bg-orange-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Appointments
            </Link>
          </>
        )}
        {/* Admin role: Check Patient, Pharmacy, Doctor Data */}
        {role === "admin" && (
          <>
            <Link
              to="/patients"
              className="bg-purple-500 text-white p-6 rounded-xl text-center shadow hover:bg-purple-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              Check Patient Data
            </Link>
            <Link
              to="/pharmacies"
              className="bg-blue-500 text-white p-6 rounded-xl text-center shadow hover:bg-blue-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              Check Pharmacy Data
            </Link>
            <Link
              to="/doctors"
              className="bg-green-500 text-white p-6 rounded-xl text-center shadow hover:bg-green-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              Check Doctor Data
            </Link>
          </>
        )}
        {/* Fallback: show links if no role or unknown role */}
        {!role && (
          <>
            <Link
              to="/pharmacies"
              className="bg-blue-500 text-white p-6 rounded-xl text-center shadow hover:bg-blue-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Pharmacies
            </Link>
            <Link
              to="/doctors"
              className="bg-green-500 text-white p-6 rounded-xl text-center shadow hover:bg-green-600 transition w-full sm:w-[300px] md:w-[350px] lg:w-[400px]"
            >
              View Doctors
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
