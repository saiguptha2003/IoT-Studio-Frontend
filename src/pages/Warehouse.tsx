import React from "react";
import WarehouseSidebar from "../components/WarehouseSidebar";

const Warehouse: React.FC = () => {
  return (
    <div>
      <WarehouseSidebar />
      <div className="pl-64">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-semibold text-gray-900">Warehouse</h1>
            <p className="mt-4 text-gray-500">
              Welcome to the Warehouse. Use the sidebar to navigate between different sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;