// 📁 src/pages/admin/AdminMessages.jsx
import React, { useEffect, useState } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import api from "@/utils/adminApi";
import { Loader2, FileDown, Eye, Trash2, Mail, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTag, setFilterTag] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const messagesPerPage = 10;

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      const messagesWithTags = res.data.map((msg) => ({
        ...msg,
        tag: msg.email.includes("@gmail")
          ? "Gmail"
          : msg.email.includes("@yahoo")
          ? "Yahoo"
          : "Autre",
        lu: msg.lu || false,
      }));
      setMessages(messagesWithTags);
      setFiltered(messagesWithTags);
    } catch (err) {
      console.error("Erreur récupération messages :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let results = messages;
    const term = search.toLowerCase();

    if (term) {
      results = results.filter(
        (m) =>
          m.nom.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.sujet.toLowerCase().includes(term) ||
          m.message.toLowerCase().includes(term) ||
          m.tag.toLowerCase().includes(term)
      );
    }

    if (filterTag) {
      results = results.filter((m) => m.tag === filterTag);
    }

    if (filterDate) {
      results = results.filter((m) =>
        new Date(m.date_envoi).toISOString().startsWith(filterDate)
      );
    }

    setFiltered(results);
    setCurrentPage(1);
  }, [search, filterTag, filterDate, messages]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Messages reçus", 14, 16);
    autoTable(doc, {
      head: [["Nom", "Email", "Sujet", "Message", "Date"]],
      body: filtered.map((m) => [
        m.nom,
        m.email,
        m.sujet,
        m.message.length > 50 ? m.message.slice(0, 50) + "..." : m.message,
        new Date(m.date_envoi).toLocaleString(),
      ]),
    });
    doc.save("messages-contact.pdf");
  };

  const handleExportCSV = () => {
    const headers = ["Nom", "Email", "Sujet", "Message", "Date"];
    const rows = filtered.map((m) => [
      m.nom,
      m.email,
      m.sujet,
      m.message.replace(/\n/g, " ").replace(/,/g, ";"),
      new Date(m.date_envoi).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "messages-contact.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce message ?")) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages(messages.filter((m) => m.id !== id));
      toast.success("Message supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Confirmer la suppression des messages sélectionnés ?")) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/messages/${id}`)));
      setMessages(messages.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
      toast.success("Messages supprimés avec succès");
    } catch (err) {
      console.error("Erreur suppression multiple :", err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleLu = async (id) => {
    try {
      const msg = messages.find((m) => m.id === id);
      const updated = { ...msg, lu: !msg.lu };
      await api.put(`/messages/${id}`, { lu: updated.lu });
      const updatedList = messages.map((m) => (m.id === id ? updated : m));
      setMessages(updatedList);
      toast.success(`Message marqué comme ${updated.lu ? "lu" : "non lu"}`);
    } catch (err) {
      console.error("Erreur mise à jour état lu :", err);
    }
  };

  const indexOfLast = currentPage * messagesPerPage;
  const indexOfFirst = indexOfLast - messagesPerPage;
  const currentMessages = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / messagesPerPage);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-[#1F75BB]">📩 Messages reçus</h1>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            className="border px-4 py-2 rounded w-full md:w-64 shadow"
          />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Tous</option>
            <option value="Gmail">Gmail</option>
            <option value="Yahoo">Yahoo</option>
            <option value="Autre">Autre</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border px-2 py-2 rounded shadow"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="bg-[#1F75BB] text-white px-4 py-2 rounded hover:bg-[#1863a1] flex items-center gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </button>
          <button onClick={handleExportCSV} className="bg-[#1F75BB] text-white px-4 py-2 rounded hover:bg-[#1863a1] flex items-center gap-2">
            <FileDown className="w-4 h-4" /> CSV
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Supprimer sélection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-6 w-6 text-[#1F75BB]" />
        </div>
      ) : filtered.length === 0 ? (
        <p>Aucun message trouvé.</p>
      ) : (
        <div className="overflow-auto rounded-xl shadow">
          <Table className="min-w-full">
            <Thead className="bg-[#1F75BB] text-white">
              <Tr>
                <Th></Th>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Sujet</Th>
                <Th>Message</Th>
                <Th>Tag</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentMessages.map((msg) => (
                <Tr key={msg.id} className={msg.lu ? "" : "bg-yellow-50"}>
                  <Td>
                    <input type="checkbox" checked={selectedIds.includes(msg.id)} onChange={() => toggleSelection(msg.id)} />
                  </Td>
                  <Td>{msg.nom}</Td>
                  <Td>{msg.email}</Td>
                  <Td>{msg.sujet}</Td>
                  <Td className="max-w-xs truncate">{msg.message}</Td>
                  <Td><span className="text-xs bg-gray-200 px-2 py-1 rounded">{msg.tag}</span></Td>
                  <Td>{new Date(msg.date_envoi).toLocaleString()}</Td>
                  <Td className="flex gap-2">
                    <button onClick={() => setSelectedMessage(msg)} className="text-blue-600 hover:underline" title="Voir détail">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${msg.sujet}`}
                      className="text-green-600 hover:underline"
                      title="Répondre"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button onClick={() => toggleLu(msg.id)} className="text-gray-600 hover:text-blue-700" title="Marquer comme lu/non lu">
                      <CheckCircle className={`w-4 h-4 ${msg.lu ? "text-green-500" : "text-gray-400"}`} />
                    </button>
                    <button onClick={() => handleDelete(msg.id)} className="text-red-600 hover:underline" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded ${currentPage === page ? "bg-[#1F75BB] text-white" : "bg-gray-100"}`}>{page}</button>
        ))}
      </div>

      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
        {selectedMessage && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1F75BB]">📨 Détail du message</h2>
            <p><strong>Nom :</strong> {selectedMessage.nom}</p>
            <p><strong>Email :</strong> {selectedMessage.email}</p>
            <p><strong>Sujet :</strong> {selectedMessage.sujet}</p>
            <p><strong>Message :</strong></p>
            <p className="whitespace-pre-wrap border rounded p-2 bg-gray-50">{selectedMessage.message}</p>
            <p><strong>Date :</strong> {new Date(selectedMessage.date_envoi).toLocaleString()}</p>
            <p><strong>Tag :</strong> {selectedMessage.tag}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMessages;
