import React, { useState, useEffect } from "react";
import { Clock, Moon, Sun, Sparkles, HeartHandshake, Compass } from "lucide-react";

export const PrayerTimesWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const prayerTimes = [
    { name: "Subuh", time: "04:42", passed: true },
    { name: "Dzuhur", time: "12:01", passed: true },
    { name: "Ashar", time: "15:20", passed: true },
    { name: "Maghrib", time: "17:58", current: true },
    { name: "Isya", time: "19:08", passed: false },
  ];

  return (
    <div className="bg-[#383827] text-[#E4E3DA] border-b border-black/10 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Time & Location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-[#f5f5f0]">
            <Clock className="w-3.5 h-3.5 text-[#A8A890]" />
            <span className="font-mono">{currentTime || "10:15:00 WIB"}</span>
          </div>
          <span className="text-[#5A5A40]">|</span>
          <div className="flex items-center gap-1 text-[#E4E3DA]/90">
            <Compass className="w-3.5 h-3.5 text-[#A8A890]" />
            <span>Zona Sentra Bisnis Masjid (WIB / DKI Jakarta)</span>
          </div>
        </div>

        {/* Center: Prayer Times Strip */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[#A8A890] font-semibold uppercase tracking-wider text-[10px]">
            Jadwal Sholat:
          </span>
          {prayerTimes.map((p, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
                p.current
                  ? "bg-[#5A5A40] text-white border border-[#A8A890]/50 font-semibold shadow-xs"
                  : "bg-[#2d2d1f]/80 text-[#E4E3DA]/80"
              }`}
            >
              <span>{p.name}</span>
              <span className="font-mono text-[#f5f5f0]">{p.time}</span>
            </div>
          ))}
        </div>

        {/* Right: Barakah Note */}
        <div className="hidden lg:flex items-center gap-2 text-[#E4E3DA]/90">
          <HeartHandshake className="w-3.5 h-3.5 text-[#A8A890]" />
          <span className="font-serif italic">"5% dari Setiap Sewa Diwakafkan untuk Kemakmuran Masjid & Ummat"</span>
        </div>
      </div>
    </div>
  );
};
