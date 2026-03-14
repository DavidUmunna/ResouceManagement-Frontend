import React from "react";
import { motion } from "framer-motion";
import { formatDate } from "./userDetails.utils";

export const OrderList = ({ orders, isExpanded }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ 
      opacity: isExpanded ? 1 : 0,
      height: isExpanded ? "auto" : 0
    }}
    transition={{ duration: 0.3 }}
    className="overflow-hidden"
  >
    <div className="mt-2 bg-white rounded-lg shadow-inner p-3 max-h-60 overflow-y-auto">
      {orders.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {orders.map((req, index) => (
            <motion.li 
              key={`order-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.01 }}
              className="py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">#{req.orderNumber}</p>
                <p className="text-sm text-gray-600">{req.Title}</p>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(req.createdAt)}
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center py-4">No requests found</p>
      )}
    </div>
  </motion.div>
);