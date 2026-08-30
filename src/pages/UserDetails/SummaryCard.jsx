import React from "react";
import { motion } from "framer-motion";

export const SummaryCard = ({ icon, title, value, suffix = "", color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl border border-gray-200 p-6 text-center"
  >
    <div className="flex justify-center">
      {icon}
    </div>
    <h3 className="mt-2 text-lg font-semibold text-gray-700">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>
      {value}{typeof suffix === "function" ? suffix(value) : suffix}
    </p>
  </motion.div>
);