// Dữ liệu đội thi đấu (placeholder) — thay bằng dữ liệu thật khi có.
// Mỗi bảng có đúng 4 đội, top ADVANCE_COUNT đội đi tiếp vào playoff.

const ADVANCE_COUNT = 2;

const GROUPS = [
  {
    id: "A",
    name: "Bảng A",
    teams: [
      { id: "A1", name: "Phoenix Rising", short: "PNX", color: "#e63946" },
      { id: "A2", name: "Iron Wolves", short: "IRW", color: "#457b9d" },
      { id: "A3", name: "Crimson Tide", short: "CRT", color: "#e76f51" },
      { id: "A4", name: "Silent Storm", short: "SST", color: "#2a9d8f" },
    ],
  },
  {
    id: "B",
    name: "Bảng B",
    teams: [
      { id: "B1", name: "Golden Hawks", short: "GHK", color: "#f4a261" },
      { id: "B2", name: "Shadow Reapers", short: "SRP", color: "#6d597a" },
      { id: "B3", name: "Thunder Legion", short: "THL", color: "#277da1" },
      { id: "B4", name: "Viper Squad", short: "VPR", color: "#588157" },
    ],
  },
  {
    id: "C",
    name: "Bảng C",
    teams: [
      { id: "C1", name: "Frost Guardians", short: "FGD", color: "#4cc9f0" },
      { id: "C2", name: "Blaze Runners", short: "BLZ", color: "#f94144" },
      { id: "C3", name: "Steel Dragons", short: "STD", color: "#8338ec" },
      { id: "C4", name: "Night Hunters", short: "NHT", color: "#43aa8b" },
    ],
  },
  {
    id: "D",
    name: "Bảng D",
    teams: [
      { id: "D1", name: "Royal Falcons", short: "RFC", color: "#f3722c" },
      { id: "D2", name: "Dark Serpents", short: "DSP", color: "#577590" },
      { id: "D3", name: "Blitz Troopers", short: "BZT", color: "#90be6d" },
      { id: "D4", name: "Omega Knights", short: "OMK", color: "#f9c74f" },
    ],
  },
];
