import { APIKey } from "../data/apikey.js";
import { getFestival } from "../utils/getFestival.js";
import { createFestivalInfo } from "../components/showInfo.js";
const { Map } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement, PinElement } =
  await google.maps.importLibrary("marker");

let markers = {};

export function initMap() {
  const mapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 10,
    maxZoom: 12, // 건물보이는정도
    minZoom: 2, // 세계지도
    disableDefaultUI: true, // 스트리트뷰이런거x, 키보드는 o
    restriction: {
      // 세계지도전체
      latLngBounds: {
        north: 85,
        south: -85,
        east: 180,
        west: -180,
      },
    },
    mapId: APIKey.MAP_ID,
  };
  const mapDiv = document.querySelector(".map-block");
  const map = new Map(mapDiv, mapOptions);
  return map;
}

export function addMarkers(map, data = getFestival()) {
  const bounds = new google.maps.LatLngBounds();
  data.forEach((festival) => {
    const pin = new PinElement({ scale: 0.8 });
    const marker = new AdvancedMarkerElement({
      map,
      position: festival["location"],
      title: festival["name"],
      content: pin.element,
    });
    bounds.extend(marker.position);
    marker.addListener("click", () => {
      // console.log(festival["id"]);
      createFestivalInfo(festival["id"]);
    });
    markers[festival["id"]] = marker;
  });
  map.fitBounds(bounds);
  return markers;
}
export function isFocusMarker(data) {
  const pinFocused = new PinElement({
    scale: 1,
    background: "#874FFF",
    borderColor: "#7131f9",
    glyphColor: "white",
  });
  markers[data].content.replaceWith(pinFocused.element);
  markers[data].zIndex = 5;
}
export function isDefaultMarker(data) {
  const pin = new PinElement({
    scale: 0.8,
  });
  markers[data].content.replaceWith(pin.element);
  markers[data].zIndex = 0;
}
export function deleteMarkers() {
  Object.values(markers).forEach((marker) => {
    marker.setMap(null);
  });
  markers = {};
  return markers;
}

export function setMapCenter(map, zoom = 7, location) {
  if (!location) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.panTo(currentLocation);
          google.maps.event.addListenerOnce(map, "idle", () => {
            animateZoom(map, zoom);
          });
        },
        () => {
          console.error("현재위치를 가져오지 못했습니다");
        }
      );
    }
    // location을 전달한 경우 해당 위치를 지도 중심으로 설정
  } else {
    map.panTo(location);
    google.maps.event.addListenerOnce(map, "idle", () => {
      animateZoom(map, zoom);
    });
  }
}

function animateZoom(map, targetZoom, speed = 150) {
  let currentZoom = map.getZoom();
  const step =
    targetZoom >= currentZoom ? (targetZoom === currentZoom ? 0 : 1) : -1;
  const zoomInterval = setInterval(() => {
    currentZoom += step;
    map.setZoom(currentZoom);

    if (currentZoom === targetZoom) {
      clearInterval(zoomInterval);
    }
  }, speed);
}

// const map = initMap();

// addMarkers(map);
// setMapCenter(map);
