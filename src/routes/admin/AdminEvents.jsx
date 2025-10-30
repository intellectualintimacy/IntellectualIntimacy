// src/routes/admin/AdminEvents.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, X, Loader2, ImageIcon } from "lucide-react";

export default function AdminEvents() {
  const [loading, setLoading] = useState(true);
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // form state
  const emptyForm = {
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: 50,
    image_url: "",
    price: 0,
    is_free: true,
    duration_minutes: 120,
    requirements: "",
    cancellation_policy: "7 days full refund",
    event_type: "in-person",
    category: "General",
  }
  const [form, setForm] = useState(emptyForm);

  // --- Admin check ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setAdminChecking(false);
          return;
        }
        // fetch profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!error && profile?.is_admin) setIsAdmin(true);
      } catch (err) {
        console.error("admin check error", err);
      } finally {
        if (mounted) setAdminChecking(false);
      }
    })();
    return () => mounted = false;
  }, []);

  // --- Load events ---
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("fetch events error", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // client-side filtered + paginated
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = events.filter(ev => {
      if (!q) return true;
      return (
        (ev.title || "").toLowerCase().includes(q) ||
        (ev.description || "").toLowerCase().includes(q) ||
        (ev.location || "").toLowerCase().includes(q) ||
        (ev.category || "").toLowerCase().includes(q)
      );
    });
    return filtered;
  }, [events, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // --- Form handlers ---
  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      date: ev.date ? ev.date.split("T")[0] : ev.date || "",
      start_time: ev.start_time || "",
      end_time: ev.end_time || "",
      location: ev.location || "",
      capacity: ev.capacity || 50,
      image_url: ev.image_url || "",
      price: ev.price || 0,
      is_free: ev.is_free ?? true,
      duration_minutes: ev.duration_minutes || 120,
      requirements: ev.requirements || "",
      cancellation_policy: ev.cancellation_policy || "7 days full refund",
      event_type: ev.event_type || "in-person",
      category: ev.category || "General",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `events/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("event-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;
      const { publicURL } = supabase.storage.from("event-images").getPublicUrl(data.path);
      return publicURL;
    } catch (err) {
      console.error("upload error", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!isAdmin) {
      alert("You are not authorized to perform this action");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        location: form.location || null,
        capacity: Number(form.capacity) || 50,
        image_url: form.image_url || null,
        price: form.price ? Number(form.price) : 0,
        is_free: !!form.is_free,
        duration_minutes: Number(form.duration_minutes) || 120,
        requirements: form.requirements || null,
        cancellation_policy: form.cancellation_policy || "7 days full refund",
        event_type: form.event_type || "in-person",
        category: form.category || "General",
        available_spots: Number(form.capacity) || 50
      };

      if (editingEvent) {
        // update
        const { data, error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id)
          .select()
          .single();

        if (error) throw error;
      } else {
        // create
        const { data, error } = await supabase
          .from("events")
          .insert([payload])
          .select();

        if (error) throw error;
      }

      await fetchEvents();
      setModalOpen(false);
    } catch (err) {
      console.error("save error", err);
      alert(err.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev) => {
    if (!confirm(`Delete event "${ev.title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", ev.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.error("delete error", err);
      alert("Failed to delete");
    }
  };

  // Protect UI render
  if (adminChecking) return <div className="p-8">Checking admin permissions...</div>;
  if (!isAdmin) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Admin access required</h2>
        <p>You must be an administrator to access this page.</p>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light">Events Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 border rounded-md"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>

          <button className="btn-elegant inline-flex items-center gap-2" onClick={openCreate}>
            <Plus /> New Event
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="col-span-full p-8 text-center text-stone-500">No events found</div>
        ) : pageItems.map(ev => (
          <div key={ev.id} className="bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden">
            <div className="h-44 bg-stone-200">
              {ev.image_url ? (
                <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <ImageIcon />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{ev.title}</h3>
                  <div className="text-xs text-stone-500">{ev.date ? new Date(ev.date).toLocaleDateString() : "—"}</div>
                </div>
                <div className="text-right text-xs text-stone-500">{ev.category}</div>
              </div>

              <p className="text-sm text-stone-600 mt-3 line-clamp-3">{ev.description}</p>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(ev)} className="px-3 py-1 border rounded-md inline-flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(ev)} className="px-3 py-1 border rounded-md text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-stone-600">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded-md">Prev</button>
          <div className="px-3 py-1 border rounded-md">{page} / {totalPages}</div>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded-md">Next</button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">{editingEvent ? "Edit Event" : "Create Event"}</h2>
              <button onClick={() => setModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Title" required className="border px-3 py-2 rounded-md" />
                <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="border px-3 py-2 rounded-md">
                  <option>General</option>
                  <option>Conversations</option>
                  <option>Workshops</option>
                  <option>Retreats</option>
                  <option>Gatherings</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <input type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} className="border px-3 py-2 rounded-md" />
                <input type="time" value={form.start_time} onChange={(e)=>setForm({...form, start_time:e.target.value})} className="border px-3 py-2 rounded-md" />
                <input type="time" value={form.end_time} onChange={(e)=>setForm({...form, end_time:e.target.value})} className="border px-3 py-2 rounded-md" />
              </div>

              <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Description" rows={4} className="border px-3 py-2 rounded-md w-full" />

              <div className="grid md:grid-cols-3 gap-3">
                <input value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} placeholder="Location" className="border px-3 py-2 rounded-md" />
                <input type="number" value={form.capacity} onChange={(e)=>setForm({...form, capacity:e.target.value})} min={1} className="border px-3 py-2 rounded-md" />
                <input type="number" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} min={0} className="border px-3 py-2 rounded-md" />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form.is_free} onChange={(e)=>setForm({...form, is_free: e.target.checked})} />
                  <span className="text-sm">Is Free</span>
                </label>

                <label className="text-sm">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await handleImageUpload(file);
                    if (url) setForm(prev => ({ ...prev, image_url: url }));
                  }}
                />
                {uploading && <Loader2 className="animate-spin" />}
                {form.image_url && <img src={form.image_url} alt="preview" className="w-20 h-12 object-cover rounded ml-auto" />}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-stone-900 text-white rounded-md">
                  {saving ? "Saving..." : (editingEvent ? "Save Changes" : "Create Event")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}
