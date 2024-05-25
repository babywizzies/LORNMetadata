"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [dropdowns, setDropdowns] = useState({});

  useEffect(() => {
    fetch('/metadata.json')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setFilteredData(data);
      });
  }, []);

  useEffect(() => {
    let result = data;
    Object.keys(filters).forEach((key) => {
      if (filters[key].length > 0) {
        if (key === 'noArmor' && filters[key][0]) {
          result = result.filter((item) =>
            !item.meta.attributes.some(attr => attr.trait_type === 'armor')
          );
        } else if (key === 'noHelmet' && filters[key][0]) {
          result = result.filter((item) =>
            !item.meta.attributes.some(attr => attr.trait_type === 'helmet')
          );
        } else if (key === 'noMask' && filters[key][0]) {
          result = result.filter((item) =>
            !item.meta.attributes.some(attr => attr.trait_type === 'mask')
          );
        } else if (key === 'noWeapon' && filters[key][0]) {
          result = result.filter((item) =>
            !item.meta.attributes.some(attr => attr.trait_type === 'weapon')
          );
        } else if (key === 'noClothes' && filters[key][0]) {
          result = result.filter((item) =>
            !item.meta.attributes.some(attr => attr.trait_type === 'clothes')
          );
        } else {
          result = result.filter((item) =>
            item.meta.attributes.some(
              (attr) => attr.trait_type === key && filters[key].includes(attr.value)
            )
          );
        }
      }
    });
    setFilteredData(result);
    setPage(1); // Reset to first page when filters change
  }, [filters, data]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (checked) {
        if (!newFilters[name]) {
          newFilters[name] = [];
        }
        newFilters[name].push(value);
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
        if (newFilters[name].length === 0) {
          delete newFilters[name];
        }
      }
      return newFilters;
    });
  };

  const toggleDropdown = (type) => {
    setDropdowns((prevDropdowns) => ({
      ...prevDropdowns,
      [type]: !prevDropdowns[type],
    }));
  };

  const uniqueAttributes = (type) =>
    [...new Set(data.flatMap((item) =>
      item.meta.attributes.filter((attr) => attr.trait_type === type).map((attr) => attr.value)
    ))];

  const attributeCategories = [
    "alignment",
    "background",
    "back",
    "body",
    "armor",
    "hair",
    "mask",
    "under"
  ];

  const additionalFilters = [
    { name: 'No Armor', key: 'noArmor' },
    { name: 'No Helmet', key: 'noHelmet' },
    { name: 'No Mask', key: 'noMask' },
    { name: 'No Weapon', key: 'noWeapon' },
    { name: 'No Clothes', key: 'noClothes' }
  ];

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to first page when limit changes
  };

  const totalPages = Math.ceil(filteredData.length / limit);
  const currentPageData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      <Head>
        <title>Gallery</title>
        <meta name="description" content="Gallery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <aside className="w-64 bg-gray-800 p-4 shadow-lg overflow-y-auto">
        {attributeCategories.map((type) => (
          <div key={type} className="mb-4">
            <button
              onClick={() => toggleDropdown(type)}
              className="w-full text-left font-semibold mb-2 bg-gray-700 p-2 rounded"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
            {dropdowns[type] && (
              <div className="ml-4">
                {uniqueAttributes(type).map((value) => (
                  <div key={value} className="mb-1">
                    <input
                      type="checkbox"
                      id={`${type}-${value}`}
                      name={type}
                      value={value}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <label htmlFor={`${type}-${value}`}>{value}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="mb-4">
          {additionalFilters.map((filter) => (
            <div key={filter.key} className="mb-1">
              <input
                type="checkbox"
                id={filter.key}
                name={filter.key}
                value="true"
                onChange={handleFilterChange}
                className="mr-2"
              />
              <label htmlFor={filter.key}>{filter.name}</label>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="limit" className="font-semibold">Images per page: </label>
          <select id="limit" value={limit} onChange={handleLimitChange} className="ml-2 p-1 border rounded bg-gray-700 text-gray-200">
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </aside>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentPageData.map((item) => (
            <div key={item.id} className="bg-gray-800 shadow-md rounded-md p-4 break-words">
              <img
                src={`https://renderer.magiceden.dev/v2/render?id=${item.id}`}
                alt={`Token Image ${item.id}`}
                className="w-full h-auto"
              />
              <div className="mt-4">
                <p className="font-semibold break-words">ID: {item.id}</p>
                {item.meta.attributes.map((attr) => (
                  <p key={attr.trait_type} className="text-sm text-gray-400 break-words">{attr.trait_type}: {attr.value}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            className="px-4 py-2 bg-gray-700 rounded mr-2"
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            className="px-4 py-2 bg-gray-700 rounded ml-2"
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
