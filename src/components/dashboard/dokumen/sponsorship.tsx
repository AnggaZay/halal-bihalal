"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DOCUMENT_TYPE = 'sponsorship';

export default function Sponsorship() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('event_documents')
        .select('file_name, file_url')
        .eq('document_type', DOCUMENT_TYPE)
        .single();

      if (data) {
        setFileName(data.file_name);
        setFileUrl(data.file_url);
      }
      setIsLoading(false);
    };
    fetchDocument();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // Batas 5MB
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      setIsUploading(true);

      const filePath = `public/${DOCUMENT_TYPE}-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('dokumen_kegiatan')
        .upload(filePath, file);

      if (uploadError) {
        alert('Gagal mengunggah file: ' + uploadError.message);
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('dokumen_kegiatan').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('event_documents')
        .update({
          file_name: file.name,
          file_url: publicUrl,
          upload_status: 'terunggah',
          uploaded_at: new Date().toISOString(),
        })
        .eq('document_type', DOCUMENT_TYPE);

      if (dbError) {
        alert('Gagal menyimpan info file: ' + dbError.message);
        await supabase.storage.from('dokumen_kegiatan').remove([filePath]);
        setIsUploading(false);
        return;
      }

      setFileName(file.name);
      setFileUrl(publicUrl);
      setIsUploading(false);
    }
  };

  const handleFileDelete = async () => {
    if (!fileUrl || !fileName) return;
    if (!window.confirm(`Yakin ingin menghapus file "${fileName}"?`)) return;

    const filePath = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    const { error: storageError } = await supabase.storage.from('dokumen_kegiatan').remove([`public/${filePath}`]);
    if (storageError) {
      alert("Gagal menghapus file dari storage: " + storageError.message);
      return;
    }

    await supabase.from('event_documents').update({ file_name: null, file_url: null, upload_status: 'belum_unggah', uploaded_at: null }).eq('document_type', DOCUMENT_TYPE);

    setFileName(null);
    setFileUrl(null);
  };

  const handleDownload = () => {
    if (fileUrl) {
      // Jika ada file terunggah, paksa unduh file tersebut dari Supabase
      window.open(`${fileUrl}?download=`, '_blank');
    } else {
      // Jika belum ada file, unduh template draft
      const link = document.createElement("a");
      link.href = "/dokumen/template-proposal-sponsorship.docx"; // Path file di public
      link.download = "Template_Proposal_Sponsorship_2026.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col overflow-hidden h-full">
      {/* Header Visual */}
      <div className="p-6 bg-gradient-to-br from-purple-500/5 to-indigo-500/10 border-b border-purple-50/50 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-28 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-purple-100 flex items-center justify-center text-purple-600 mb-4 relative z-10 group-hover:-translate-y-1 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h3 className="text-lg md:text-xl font-bold text-gray-800 relative z-10">Proposal Sponsorship</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 relative z-10">Draf pengajuan dana, list paket sponsor, dan surat penawaran mitra.</p>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-6">
        
        {/* Status File */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl animate-pulse">
              <p className="text-xs font-medium text-gray-500">Memuat status file...</p>
            </div>
          ) : isUploading ? (
            <div className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl animate-pulse">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-purple-700">Mengunggah dokumen...</p>
            </div>
          ) : fileName ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl group/file">
              <a href={fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-green-600 shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-xs font-medium text-green-800 truncate flex-1 group-hover/file:underline" title={fileName}>{fileName}</p>
              </a>
              <button onClick={handleFileDelete} className="text-gray-400 hover:text-red-500 shrink-0 p-1 rounded-md hover:bg-red-50 transition-colors" title="Hapus file">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
              <div className="text-gray-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-xs font-medium text-gray-500 italic">Belum ada file final terunggah.</p>
            </div>
          )}
        </div>

        {/* Aksi */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Unggah Final
          </button>
          <button onClick={handleDownload} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {fileName ? "Unduh File" : "Unduh Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}