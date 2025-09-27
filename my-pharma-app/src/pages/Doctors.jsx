import React, { useEffect, useState } from "react";
import { getDoctors, getDepartments } from "../api";
import DoctorCard from "../components/DoctorCard";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data));
    fetchDoctors();
  }, []);

  const fetchDoctors = async (department = selectedDept, page = 1, append = false) => {
    setLoading(true);
    const filters = department ? { department } : {};
    const res = await getDoctors(filters, page);
    const newDoctors = append ? [...doctors, ...res.data.data] : res.data.data;
    setDoctors(newDoctors);
    setPagination({ page, hasMore: res.data.pagination.hasMore });
    setLoading(false);
  };

  const handleDeptChange = (e) => {
    const dept = e.target.value;
    setSelectedDept(dept);
    fetchDoctors(dept, 1);
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchDoctors(selectedDept, pagination.page + 1, true);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 font-semibold">Doctors</h2>
      <div className="mb-4">
        <select
          value={selectedDept}
          onChange={handleDeptChange}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept.department_name}>
              {dept.department_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <DoctorCard key={doc.doctor_id} doctor={doc} />
        ))}
      </div>
      {pagination.hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
