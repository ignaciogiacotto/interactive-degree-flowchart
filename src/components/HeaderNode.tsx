import { memo } from "react";

const HeaderNode = ({
  data,
}: {
  data: { label: string; darkMode: boolean };
}) => {
  return (
    <div
      className={`px-12 py-6 rounded-3xl border-4 shadow-2xl font-bold text-30px uppercase tracking-[0.25em] min-w-[450px] text-center ${
        data.darkMode
          ? "bg-slate-950 border-indigo-600 text-indigo-400"
          : "bg-slate-900 border-slate-700 text-white"
      }`}>
      {data.label}
    </div>
  );
};

export default memo(HeaderNode);
