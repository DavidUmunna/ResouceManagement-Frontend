import React, { useState, useEffect } from 'react';
import { FaFlag, FaTimes, FaCopy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Duplicates = ({ orders, onOrderSelect }) => {
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  // Calculate similarity between two strings
  const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  };

  // Compare products between two orders
  const compareProducts = (products1, products2) => {
    if (!products1 || !products2) return false;
    if (products1.length !== products2.length) return false;
    
    const productMap1 = {};
    const productMap2 = {};
    
    products1.forEach(p => productMap1[`${p.name}-${p.quantity}`] = true);
    products2.forEach(p => productMap2[`${p.name}-${p.quantity}`] = true);
    
    const keys1 = Object.keys(productMap1);
    const keys2 = Object.keys(productMap2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => productMap2[key]);
  };

  // Detect duplicate orders
  useEffect(() => {
    const groups = [];
    const processed = new Set();
    
    orders.forEach((order1, i) => {
      if (processed.has(i)) return;
      
      const group = [order1];
      
      orders.slice(i + 1).forEach((order2, j) => {
        const originalIndex = i + j + 1;
        if (processed.has(originalIndex)) return;
        
        // Compare products
        const sameProducts = compareProducts(order1.products, order2.products);
        
        // Compare remarks
        const remarkSimilarity = calculateSimilarity(
          order1.remarks || '', 
          order2.remarks || ''
        );
        
        if (sameProducts || remarkSimilarity >= similarityThreshold) {
          group.push(order2);
          processed.add(originalIndex);
        }
      });
      
      if (group.length > 1) {
        groups.push(group);
        processed.add(i);
      }
    });
    
    setDuplicateGroups(groups);
  }, [orders, similarityThreshold]);

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
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="0.5">Low</option>
            <option value="0.7">Medium</option>
            <option value="0.9">High</option>
          </select>
        </div>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No duplicate requests found
        </div>
      ) : (
        <div className="space-y-4 ">
          {duplicateGroups.map((group, groupIndex) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Duplicates;