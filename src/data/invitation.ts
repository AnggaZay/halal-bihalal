// Data undangan Halal Bihalal
export interface Host {
  fullName: string;
  shortName: string;
  parents: string;
  photo: string;
  address: string;
}

export interface CoHost {
  fullName: string;
  shortName: string;
  parents: string;
  photo: string;
  address: string;
}

export interface Event {
  date: string;
  time: string;
  location: string;
  address: string;
}

export interface HalalBihalalData {
  coverPhoto: string;
  host: Host;
  coHost: CoHost;
  events: {
    mainEvent: Event;
    gathering: Event;
    additionalEvent: Event;
    mapsUrl: string;
  };
}

export interface CoverProps {
  data: HalalBihalalData;
  onOpen: () => void;
  guestName?: string | null;
}

// Data contoh untuk undangan Halal Bihalal
export const HalalBihalalData: HalalBihalalData = {
  coverPhoto: "/images/bingkai-1.webp", // Ganti dengan path gambar cover yang sesuai
  host: {
    fullName: "Panitia Halal Bihalal IPM",
    shortName: "Panitia IPM",
    parents: "Ikatan Pelajar Muhammadiyah",
    photo: "/images/foto-host.jpg",
    address: "Pekalongan, Jawa Tengah"
  },
  coHost: {
    fullName: "Angkatan 11 Alumni IPM",
    shortName: "Angkatan 11",
    parents: "Ikatan Pelajar Muhammadiyah",
    photo: "/images/foto-cohost.jpg",
    address: "Pekalongan, Jawa Tengah"
  },
  events: {
    mainEvent: {
      date: "5 April 2026",
      time: "18.30",
      location: "Warmindo 17",
      address: "Pekajangan, Kab. Pekalongan"
    },
    gathering: {
      date: "5 April 2026",
      time: "18.30",
      location: "Warmindo 17",
      address: "Pekajangan, Kab. Pekalongan"
    },
    additionalEvent: {
      date: "",
      time: "",
      location: "",
      address: ""
    },
    mapsUrl: "https://maps.app.goo.gl/XV44FGvCULpMbxdBA"
  }
};
