// src/DJcon.js
import React, { useState, useEffect } from 'react';
import { syncBubbles } from './Sync';
import { MP } from './MP';
import L from 'leaflet';

function BubbleItem({ id, idx, b, playlist, onUpdate, onDelete }) {
  const [title, setTitle] = useState(b.title || '');
  const [mediaUrl, setMediaUrl] = useState(b.mediaUrl || '');

  useEffect(() => setTitle(b.title || ''), [b.title]);
  useEffect(() => setMediaUrl(b.mediaUrl || ''), [b.mediaUrl]);

  const visible = b.circle.options.opacity !== 0;

  const updateTitleLabel = () => {
    const el = b.marker?.getElement?.();
    if (!el) return;
    b.marker.setOpacity(b.showTitle ? 1 : 0);
    el.innerHTML = b.showTitle
      ? `<div style="display:inline-block;background:white;padding:2px 6px;border-radius:6px;border:1px solid black;font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.title}</div>`
      : `<div style="width:12px;height:12px;background:black;border-radius:50%;"></div>`;
  };

  return (
    <div style={{ borderBottom: '1px solid #ddd', padding: '4px 0' }}>
      <label style={{ fontSize: 12 }}>
        <input
          type="checkbox"
          checked={b.showTitle || false}
          onChange={(e) => {
            onUpdate(id, { showTitle: e.target.checked });
            updateTitleLabel();
          }}
        /> Titre
      </label>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30 }}>#{idx + 1}</div>

          <button onClick={() => onUpdate(id, { visible: !visible })}>
            {visible ? '●' : '○'}
          </button>

          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onUpdate(id, { title: e.target.value });
              updateTitleLabel();
            }}
            placeholder="Titre"
            style={{ flex: 1 }}
          />

          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={b.detectable ?? true}
              onChange={(e) => onUpdate(id, { detectable: e.target.checked })}
            /> Détectable
          </label>

          <button onClick={() => onDelete(id)} style={{ color: 'red' }}>
            ✖
          </button>
        </div>

        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => {
            setMediaUrl(e.target.value);
            onUpdate(id, { mediaUrl: e.target.value });
          }}
          placeholder="URL audio ou vidéo"
          style={{ width: '100%', marginTop: 4 }}
        />

        {playlist.length > 0 && (
          <select
            onChange={(e) => {
              setMediaUrl(e.target.value);
              onUpdate(id, { mediaUrl: e.target.value });
            }}
            defaultValue=""
            style={{ marginTop: 4 }}
          >
            <option disabled value="">Assigner une URL</option>
            {playlist.map((url, i) => (
              <option key={i} value={url}>{url}</option>
            ))}
          </select>
        )}

        <MP url={mediaUrl} />
      </div>
    </div>
  );
}

export function DJcon({ map, sessionId, circlesRef }) {
  const [order, setOrder] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    setOrder(Object.keys(circlesRef.current || {}));
  }, [circlesRef.current]);

  const handleUpdate = (id, updates) => {
    const b = circlesRef.current[id];
    if (!b) return;

    if (updates.title !== undefined) b.title = updates.title;
    if (updates.mediaUrl !== undefined) b.mediaUrl = updates.mediaUrl;
    if (updates.detectable !== undefined) b.detectable = updates.detectable;
    if (updates.showTitle !== undefined) b.showTitle = updates.showTitle;

    if (updates.visible !== undefined) {
      b.circle.setStyle({ opacity: updates.visible ? 1 : 0, fillOpacity: updates.visible ? 0.2 : 0 });
      b.marker.setOpacity(updates.visible ? 1 : 0);
    }

    syncBubbles(sessionId, circlesRef.current);
  };

  const handleDelete = (id) => {
    const b = circlesRef.current[id];
    if (!b) return;
    map.removeLayer(b.circle);
    map.removeLayer(b.marker);
    delete circlesRef.current[id];
    setOrder(prev => prev.filter(x => x !== id));
    syncBubbles(sessionId, circlesRef.current);
  };

  const deleteAll = () => {
    if (!window.confirm("Supprimer toutes les bulles ?")) return;
    Object.values(circlesRef.current).forEach(b => {
      map.removeLayer(b.circle);
      map.removeLayer(b.marker);
    });
    circlesRef.current = {};
    setOrder([]);
    syncBubbles(sessionId, {});
  };

  const fitAllBubbles = () => {
    const bounds = L.latLngBounds([]);
    Object.values(circlesRef.current).forEach(b => {
      bounds.extend(b.circle.getLatLng());
    });
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
  };

  return (
    <div style={{ padding: 8, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button onClick={fitAllBubbles}>Centrer sur les bulles</button>
        <button onClick={deleteAll} style={{ color: 'red' }}>Tout supprimer</button>
      </div>

      <input
        type="file"
        accept=".txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const lines = reader.result.split('\n').map(l => l.trim()).filter(Boolean);
            setPlaylist(lines);
          };
          reader.readAsText(file);
        }}
        style={{ marginBottom: 10 }}
      />

      {order.map((id, idx) => {
        const b = circlesRef.current[id];
        if (!b) return null;
        return (
          <BubbleItem
            key={id}
            id={id}
            idx={idx}
            b={b}
            playlist={playlist}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}