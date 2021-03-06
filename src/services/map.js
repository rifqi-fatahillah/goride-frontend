const google = window.google;
const geocoder = new google.maps.Geocoder;

exports.getCurrentPosition = (onSuccess, onError = () => { }) => {
  if ('geolocation' in navigator === false) {
    return onError(new Error('Geolocation is not supported by your browser.'));
  }

  return navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

exports.trackLocation = (onSuccess, onError = () => { }) => {
  if ('geolocation' in navigator === false) {
    return onError(new Error('Geolocation is not supported by your browser.'));
  }

  return navigator.geolocation.watchPosition(onSuccess, onError);
};

exports.clearLocationTrack = trackLocationId => { navigator.geolocation.clearWatch(trackLocationId) }

exports.getMapOptions = (lat, lng, zoom = 17) => {
  return {
    center: new google.maps.LatLng(lat, lng),
    zoom: zoom,
    clickableIcons: false
  }
}

exports.position = (lat, lng) => ({ lat: lat, lng: lng })

exports.createMarker = (lat, lng, map, icon = undefined, title = "", cb = undefined) => {
  if (lat && lng && map) {
    const marker = new google.maps.Marker({
      position: { lat, lng },
      icon: icon,
      map: map,
      title: title
    });

    if (cb)
      cb(marker);
  }
}

exports.clearMarkersFromMap = (markers, cb = undefined) => {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }

  if (cb)
    cb();
}

exports.getDistanceInMeter = (srcLat, srcLng, dstLat, dstLng, avoidTolls, avoidHighways, cb) => {
  const directionsService = new google.maps.DirectionsService();

  directionsService.route({
    origin: new google.maps.LatLng(srcLat, srcLng),
    destination: new google.maps.LatLng(dstLat, dstLng),
    travelMode: google.maps.TravelMode.DRIVING,
    avoidHighways: avoidHighways,
    avoidTolls: avoidTolls
  }, (response, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      cb(response.routes[0].legs[0].distance.value);
    }
    else {
      return undefined;
    }
  });
}

exports.geocodeLatLng = (latLng, cb) => {
  geocoder.geocode({ 'location': latLng }, function (results, status) {
    if (status === 'OK') {
      if (results[0]) {
        cb(results[0].place_id, results[0].formatted_address, results[0].geometry.location.lat(), results[0].geometry.location.lng())
      }
    }
  })
}

exports.mapLocation = (srcLat, srcLng, dstLat, dstLng, map, directionsDisplay, cb = undefined) => {
  var directionsService = new google.maps.DirectionsService();
  const start = new google.maps.LatLng(srcLat, srcLng);
  const end = new google.maps.LatLng(dstLat, dstLng);

  const calcRoute = () => {
    var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        directionsDisplay.setMap(map);
      }
      else{
        directionsDisplay.setMap(null);
        directionsDisplay.set('directions', null);
      }
    });
  };
  calcRoute();
  google.maps.event.addDomListener(window, "load", calcRoute);
}