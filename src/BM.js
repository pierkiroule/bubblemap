import { useEffect, useRef } from 'react'; import L from 'leaflet'; import 'leaflet-path-drag'; import { syncBubbles, useBubbles } from './Sync';

export function BM({ map, sessionId, circlesRef, onReady, mode }) { const activeRef = useRef(null); const pinchRef = useRef(false); const lastDist = useRef(0); const lastTap = useRef(0); const lastTapCoords = useRef(null); const bubbles = useBubbles(sessionId);

const createBubble = (ll) => { const cid = Date.now().toString(); const circle = L.circle(ll, { radius: 30, color: 'blue', draggable: true, }).addTo(map);

const marker = L.marker(ll, {
  draggable: true,
  icon: L.divIcon({
    html: '<div style="width:12px;height:12px;background:black;border-radius:50%;"></div>',
  }),
}).addTo(map);

marker.setOpacity(0);
marker.on('drag', (e) => {
  circle.setLatLng(e.target.getLatLng());
  syncBubbles(sessionId, circlesRef.current);
});

circlesRef.current[cid] = {
  circle,
  marker,
  title: `Bulle ${cid}`,
  mediaUrl: '',
  detectable: true,
  showTitle: false,
};
syncBubbles(sessionId, circlesRef.current);

};

useEffect(() => { if (!map) return;

const ctr = map.getContainer();

const findClosest = (ll) => {
  let best = null, dmin = Infinity;
  Object.entries(circlesRef.current).forEach(([id, { circle }]) => {
    const d = circle.getLatLng().distanceTo(ll);
    if (d < dmin) {
      dmin = d;
      best = { id, circle };
    }
  });
  return best;
};

const deselectAll = () => {
  Object.values(circlesRef.current).forEach(({ circle, marker }) => {
    circle.setStyle({ color: 'blue' });
    marker.setOpacity(0);
  });
  activeRef.current = null;
};

const selectBubble = (id) => {
  Object.entries(circlesRef.current).forEach(([cid, { circle, marker }]) => {
    const isActive = cid === id;
    if (mode?.bubblesVisible !== false) {
      circle.setStyle({ color: isActive ? 'red' : 'blue' });
      marker.setOpacity(isActive ? 1 : 0);
    }
  });
};

const onTouchStart = (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    pinchRef.current = true;
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();

    const rect = ctr.getBoundingClientRect();
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
    const ll = map.containerPointToLatLng(L.point(midX, midY));

    activeRef.current = findClosest(ll);
    lastDist.current = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
};

const onTouchMove = (e) => {
  if (pinchRef.current && e.touches.length === 2 && activeRef.current) {
    e.preventDefault();
    const newD = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const scale = newD / lastDist.current;
    lastDist.current = newD;

    const c = activeRef.current.circle;
    c.setRadius(c.getRadius() * scale);
    syncBubbles(sessionId, circlesRef.current);
  }
};

const onTouchEnd = (e) => {
  if (pinchRef.current && e.touches.length < 2) {
    pinchRef.current = false;
    activeRef.current = null;
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    return;
  }

  if (e.changedTouches.length === 1 && !pinchRef.current) {
    const now = Date.now();
    const t = e.changedTouches[0];
    const rect = ctr.getBoundingClientRect();
    const pt = L.point(t.clientX - rect.left, t.clientY - rect.top);
    const ll = map.containerPointToLatLng(pt);
    const hit = findClosest(ll);
    const onB = hit && ll.distanceTo(hit.circle.getLatLng()) < 50;

    if (onB) {
      selectBubble(hit.id);
    } else {
      const delta = now - lastTap.current;
      const sameSpot = lastTapCoords.current &&
        ll.distanceTo(lastTapCoords.current) < 20;

      if (delta < 350 && sameSpot) {
        createBubble(ll);
      } else {
        deselectAll();
      }

      lastTap.current = now;
      lastTapCoords.current = ll;
    }
  }
};

ctr.addEventListener('touchstart', onTouchStart, { passive: false });
ctr.addEventListener('touchmove', onTouchMove, { passive: false });
ctr.addEventListener('touchend', onTouchEnd, { passive: false });

return () => {
  ctr.removeEventListener('touchstart', onTouchStart);
  ctr.removeEventListener('touchmove', onTouchMove);
  ctr.removeEventListener('touchend', onTouchEnd);
};

}, [map, sessionId, mode]);

useEffect(() => { if (!map || !bubbles) return;

let added = false;

bubbles.forEach(([id, data]) => {
  const {
    lat,
    lng,
    radius: r,
    color = 'blue',
    title = '',
    mediaUrl = '',
    detectable = true,
    showTitle = false
  } = data || {};

  if (!lat || !lng || !r) return;

  if (!circlesRef.current[id]) {
    const circle = L.circle([lat, lng], {
      radius: r,
      color,
      draggable: true,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        html: '<div style="width:12px;height:12px;background:black;border-radius:50%;"></div>',
      }),
    }).addTo(map);

    if (showTitle && title) {
      const el = marker.getElement?.();
      if (el) {
        el.innerHTML = `<div style="background:white;border:1px solid black;border-radius:6px;padding:2px 6px;font-size:12px;">${title}</div>`;
      }
    }

    marker.setOpacity(showTitle ? 1 : 0);

    marker.on('drag', (e) => {
      circle.setLatLng(e.target.getLatLng());
      syncBubbles(sessionId, circlesRef.current);
    });

    circlesRef.current[id] = { circle, marker, title, mediaUrl, detectable, showTitle };
    added = true;
  } else {
    const { circle, marker } = circlesRef.current[id];
    circle.setLatLng([lat, lng]);
    circle.setRadius(r);
    marker.setLatLng([lat, lng]);
    circlesRef.current[id] = { ...circlesRef.current[id], title, mediaUrl, detectable, showTitle };
  }
});

if (onReady && (added || bubbles.length > 0)) {
  onReady();
}

}, [map, bubbles, sessionId]);

return null; }

