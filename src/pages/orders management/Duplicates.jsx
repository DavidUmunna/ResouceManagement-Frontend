import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFlag, FaTimes, FaCopy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../components/Pagination';

const GROUPS_PER_PAGE = 5;

const Duplicates = ({ onOrderSelect }) => {
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Detection runs server-side over all orders the user can see (not just the
  // current page), with proper transitive grouping.
  useEffect(() => {
    let cancelled = false;
    const fetchDuplicates = async () => {
      setLoading(true);
      // TEMP: artificial delay to test the duplicates loading skeleton — REMOVE before deploy
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        const res = await axios.get(`${API_URL}/orders/duplicates`, {
          params: { threshold: similarityThreshold },
          headers: { 'ngrok-skip-browser-warning': 'true' },
          withCredentials: true,
        });
        if (!cancelled) {
          setDuplicateGroups(res.data?.data || []);
          setPage(1);
        }
      } catch {
        if (!cancelled) setDuplicateGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDuplicates();
    return () => { cancelled = true; };
  }, [similarityThreshold]);

  // Keep the current page within range as the group count changes
  useEffect(() => {
    const totalPages = Math.ceil(duplicateGroups.length / GROUPS_PER_PAGE);
    if (page > totalPages) setPage(totalPages || 1);
  }, [duplicateGroups, page]);

  const toggleGroup = (index) => {
    setExpandedGroup(expandedGroup === index ? null : index);
  };

  /*const mergeOrders = (orderIds) => {
    console.log('Merging orders:', orderIds);
    // Implementatiion of logic
  };*/

  const handleOrderClick = (orderId, e) => {
    e.stopPropagation();
    if (onOrderSelect) {
      onOrderSelect(orderId);
      const element = document.getElementById(`order-${orderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <div className="p-4 bg-gray-200 rounded-lg ">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaFlag className="text-red-500 mr-2" />
          Potential Duplicates
        </h2>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-600">Similarity:</label>
          <select 
            value={similarityThreshold}
            onChange={(e) => { setSimilarityThreshold(parseFloat(e.target.value)); setPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="0.5">Low</option>
            <option value="0.7">Medium</option>
            <option value="0.9">High</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 bg-white rounded-lg p-4">
              <div className="animate-pulse flex items-center">
                <div className="bg-gray-200 rounded-full w-6 h-6 mr-3" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : duplicateGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No duplicate requests found
        </div>
      ) : (
        <div className="space-y-4 ">
          {duplicateGroups
            .slice((page - 1) * GROUPS_PER_PAGE, page * GROUPS_PER_PAGE)
            .map((group, localIndex) => {
            const groupIndex = (page - 1) * GROUPS_PER_PAGE + localIndex;
            return (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden"
            >
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-yellow-100"
                onClick={() => toggleGroup(groupIndex)}
              >
                <div className="flex items-center">
                  
                  <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                    {group.length}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {group[0].Title || "Untitled Request"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {group.length || 0} similar items
                    </p>
                  </div>
                </div>
                <div className="text-gray-500">
                  {expandedGroup === groupIndex ? <FaTimes /> : <FaCopy />}
                </div>
              </div>

              <AnimatePresence>
                {expandedGroup === groupIndex && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border-t border-yellow-100"
                  >
                    <div className="p-4 space-y-4  max-h-72 overflow-y-auto">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-700">
                          Similar Requests ({group.length})
                        </h4>
                        {/*<button
                          onClick={(e) => {
                            e.stopPropagation();
                            mergeOrders(group.map(o => o._id));
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center"
                        >
                          <FaLink className="mr-1" /> Merge
                        </button>*/}
                      </div>

                      <div className="space-y-3">
                        {group.map((order, orderIndex) => (
                          <div 
                            key={orderIndex}
                            className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => handleOrderClick(order._id, e)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {order.orderedBy} • {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            {order.remarks && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Remarks:</span> {order.remarks}
                                </p>
                              </div>
                            )}

                            <div className="mt-2">
                              <p className="text-sm font-medium">Products:</p>
                              <ul className="text-sm text-gray-600">
                                {order.products?.map((product, idx) => (
                                  <li key={idx}>
                                    • {product.name} (Qty: {product.quantity}, ₦{product.price})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            );
          })}

          <Pagination
            page={page}
            totalPages={Math.ceil(duplicateGroups.length / GROUPS_PER_PAGE)}
            total={duplicateGroups.length}
            limit={GROUPS_PER_PAGE}
            onPage={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default Duplicates;