
//*********************************************************************\
//*                                                                     *
//* mapview.js                                          by ravi         *
//*                                                                     *
//* A Google Maps API Wrapper and Extension                             *
//*                                                                     *
//*                                                                     *
//***********************************************************************
//*                                                                     *
//* Version 0.9       2011/02/21                                        *
//*                                                                     *
//\*********************************************************************/


//* macro defnitions
var MAP_STEP_INDEX_UNDEFINED		= -3;
var MAP_MARKER_ID_UNDEFINED		= -3;
var MAP_NAVI_ICON_MARKER_ID		= -5;
var MAP_IMPORT_FLAG_MARKER_ID		= -6;
var MAP_REPLY_TIMEOUT			= 1;

var MapJSEventLoadStarted 		= 99;
var MapJSEventLoadFinished 		= 100;
var MapJSEventFunctionFinished 		= 0;
var MapJSEventMarkerMouseDownOthers	= 6;

var MapDefaultIconWidthMax		=120;
var MapDefaultIconHeightMax		=120;

const IMG_FLAG_SHADOW = './image/flags/Map_Flag_shadow.png';
const IMG_FLAG_DUMMY  = './image/flags/Dummy.png';
var MapNaviDefaultIcon		= 1;
var MapNaviWalkingIcon		= 2;
var MapNaviCarIcon			= 3;
var MapNaviWalkHeading		= 4;
var MapNaviCarHeading		= 5;
var MapNaviBookMarkIcon		= 6;
var MapNaviSearchResultIcon	= 9;
var MapNaviDirectionFromIcon	= 8;
var MapNaviDirectionFromToIcon	= 9;
var MapNaviFlagIcon		= 10;
var MapNaviCustomIcon		= 11;


            var map;
			var GlobalMarkerList = [];
			var projectionHelper=null;
            var directionsService;
                var directionsDisplay;
            var directionResponse;
            var stepCounter = 0;
            var moveToStep = 1;    

            var dirn;
            var localSearch;
            var dirstpoint;
            var direndpoint;
            var directionsPolyline;
            var points = [];
            var paths = [];
            var enc_levels = [];
            var highlighted_marker ;
            var point_markers = [];
            var overlays = [];
            var listIndex = 0;
            var gpopupOpen = false;
            var selectCircle = null;
            var selectCircleImage = "./image/flags/Select_Circle_Red_circle.png";
            var directionLine = null;
            var directionEndmarker = null;
            var directionStmarker = null;
            
            var navi_icons = new Array(
            './image/flags/Map_Flag_Purple.png',
            '',
            './image/navigation/Map_Human.png',
            './image/navigation/Map_Car.png',
            './image/navigation/Map_Human_compass.png',
            './image/navigation/Map_Car_compass.png',
            './image/bookmark/Map_Bookmark.png',
            './image/flags/Map_Flag_Purple.png',
            './image/flags/Map_Flag_green.png',
            './image/flags/Map_Flag_red.png',
            './image/flags/Map_Flag_Purple.png'
            );
            
            var imageurlWidgth = MapDefaultIconWidthMax;
            var imageurlHeight = MapDefaultIconHeightMax;

	    var navi_icons_size = new Array(
	    {w:104,h:68},
	    {w:MapDefaultIconWidthMax,h:MapDefaultIconHeightMax},
	    {w:80,h:80},
	    {w:100,h:100},
	    {w:176,h:204},
	    {w:176,h:204},
	    {w:80,h:80},
	    {w:104,h:68},
	    {w:104,h:68},
	    {w:104,h:68},
	    {w:104,h:68},
	    {w:MapDefaultIconWidthMax,h:MapDefaultIconHeightMax}
	    );
	    
            var navi_box = new Array(null, null, null, null, null);
            var navi_marker = new Array(null, null, null, null, null);
            var current_navi = null;
            var accuracy_circle = null;
            var direction_marker = [];
            var directionStep = -1;
            var gStep = -1;
            var prevDirStep = -1;
            var startDirStep = -1;
            var endDirStep = -1;
            var clearDestination = -1;
            var currentIconId = -1;
            var accurecyAdjust = new Array(
                0,
                24,
                80,
                100,
                204,
                204,
                204,
                204,
                204,
                204
                );
            var isNavigationEnabled = false;
            var movePoint = null;
            var gmarkersList  = new Array();
            var gmarkersIdList = new Array();
            var gCounter = 0;
            var gpopupList = new Array();
            var gdmarkersList  = new Array();
            var gdpopupList = new Array();
            var latlngbounds = new google.maps.LatLngBounds();
            var gPopupFixBounds = false;
            var trafficLayer = null;
            var cppContext = new CppContextHelper();

//      var res = window.confirm("FunctionId=160");
            var gUpdateSerialize = true;
            var zoomChanged;
        var bootintState = true;

           var glineList    = new Array();
           var glineIdList  = new Array();
           var gCircleList = new Array();
           var gCircleIdList = new Array();
           var httpRequest   = null;


function AttachedMarker(vmarkerObj, vmarkerId, viconId) 
{
    this.Marker = vmarkerObj;
    this.Id 	= vmarkerId;
    this.IconId = viconId;
}

        
function testAlert()
{
alert("heleo");
}

function sendStartEvent(jsonParamListObj)
{
   var mcontext = new CppContextHelper();

    mcontext.SetFunctionId(0);
    mcontext.SetEventType(MapJSEventLoadStarted);
    mcontext.SetRetValue(0);
    mcontext.SetAtomicId(0);
    mcontext.SetPoCId(0);
    mcontext.SetLoadFinished(0);
    mcontext.ForceSerialize();
    delete mcontext;
}

function setNativeResult(jsonParamListObj, isserialize)
{
//  window.external.Result.value = resultval;
    cppContext.SetRetValue(jsonParamListObj.Error);
    
    if (isserialize)
    {
     cppContext.SetPoCId(1);
     cppContext.SetLoadFinished(1);
     cppContext.ForceSerialize();
    }    

}

function setNativeResult2(jsonParamListObj, isserialize)
{
	var mfunctionId = parseInt(jsonParamListObj.Function.Id);
	var matomicId = parseInt(jsonParamListObj.Function.AtomicId);
	
	var sendContext = new CppContextHelper();
	sendContext.SetFunctionId(mfunctionId);
	sendContext.SetAtomicId(matomicId);    
	sendContext.SetRetValue(0);
	sendContext.SetEventType(MapJSEventFunctionFinished);
	if (isserialize)
	{
		sendContext.SetPoCId(2);
		sendContext.SetLoadFinished(1);
		sendContext.ForceSerialize();
	}
}

function ShowMap(nativeParam) 
{
	if(httpRequest)
	{
		httpRequest.abort();
	}

    document.getElementById('mapview').style.display   = 'block';
    document.getElementById('htmlview').style.display  = 'none';
    document.getElementById('htmlview').innerHTML      = ''
    google.maps.event.trigger(map, 'resize');
}

function ShowUrl(nativeParam) 
{
	document.getElementById('mapview').style.display   = 'none';
	document.getElementById('htmlview').style.display  = 'block';

	if(httpRequest == null)
	{
	    httpRequest = new XMLHttpRequest();
	}

	var url = nativeParam.Url;

	httpRequest.open('GET', url, true); 
	httpRequest.onreadystatechange = function()
	{
		if(httpRequest.readyState == 4 && httpRequest.status == 200)
		{
			document.getElementById('htmlview').innerHTML = httpRequest.responseText;
		}
	}

	httpRequest.send(null);
}

function MapResize(nativeParam)
{
  var dx = parseInt(nativeParam.Width);
  var dy = parseInt(nativeParam.Height);
  
  var mapdiv = map.getDiv();
  var width = parseInt(mapdiv.style.width);
  var height =  parseInt(mapdiv.style.height);

  mapdiv.style.width = (dx) + "px";
  mapdiv.style.height= (dy) + "px";
  google.maps.event.trigger(map, 'resize');
    
}

function googleMapAdapterTable(jsonParamListObj)
{
        cppContext.SetEventType(0);
        jsonParamListObj.Error = 0;
    var result = null;
    var functionId = parseInt(jsonParamListObj.Function.Id);
    cppContext.SetFunctionId(functionId);
    var atomicId = parseInt(jsonParamListObj.Function.AtomicId);
    cppContext.SetAtomicId(atomicId);    

    gUpdateSerialize = true;
    
    switch (functionId)
    {
        case 0x00a: 
            {
                InitializeGoogleMapFromWidget(jsonParamListObj);                
                setNativeResult(jsonParamListObj, false);
                break;
            }
    
        case 0x00b: 
            {
                InitializeGoogleMapWithDetails(jsonParamListObj, 'mapview');                
                setNativeResult(jsonParamListObj, false);
                break;
            }

        case 0x10a: 
            {
                MapZoomIn(jsonParamListObj);                
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x10b: 
            {
                MapZoomOut(jsonParamListObj);               
                setNativeResult(jsonParamListObj, false);
                break;
            }

        case 0x10c: 
            {
                MapGetZoom(jsonParamListObj);               
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x10d: 
            {
                gUpdateSerialize = false;
                MapZoomIn(jsonParamListObj);                
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x10e: 
            {
                gUpdateSerialize = false;
                MapZoomOut(jsonParamListObj);               
                setNativeResult(jsonParamListObj, false);
                break;
            }

        case 0x11a: 
            {
                MapSetType(jsonParamListObj);               
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x12a: 
            {
                MapSetCenter(jsonParamListObj);             
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x12b: 
            {
                MapGetCenter(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
            
        case 0x13a: 
            {
                MapMoveTo(jsonParamListObj);                
                break;
            }
            
        case 0x14a: 
            {
                MapShowNaviIcon(jsonParamListObj, true);                
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x14b: 
            {
                MapUpdatePositioning(jsonParamListObj);             
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x14c: 
            {
                MapUpdatePositioningWithHeading(jsonParamListObj);              
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x59a: 
            {
                MapGetDirection(jsonParamListObj);              
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x59b: 
            {
                MapDirectionShowStep(jsonParamListObj);             
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x59c: 
            {
                MapDirectionClear(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }

        case 0x61a: 
            {
                MapShowTrafficOverlay(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x61b: 
            {
                MapClearTrafficOverlay(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x61c: 
            {
                MapCheckTrafficOverlay(jsonParamListObj);   
                setNativeResult(jsonParamListObj, false);
		setTimeout ( function()
		{
		       var timeContext = new CppContextHelper();
		    	timeContext.SetFunctionId(functionId);
		    	timeContext.SetAtomicId(atomicId);    
		    	timeContext.SetRetValue(MAP_REPLY_TIMEOUT);
		       timeContext.SetEventType(MapJSEventFunctionFinished);
		       timeContext.SetPoCId(2);
		       timeContext.SetLoadFinished(1);
			timeContext.ForceSerialize();
		}, 4000 );
                
                break;
            }
        

        case 0x75: 
            {
                MapAddMarkerWithImage(jsonParamListObj);
                setNativeResult(jsonParamListObj, false);
                break;
            }
        case 0x75a: 
            {
                MapRemoveMarker(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x75b: 
            {
                MapAddMarkerList(jsonParamListObj);
                setNativeResult(jsonParamListObj, false);
                break;
            }
            
        case 0x76: 
            {
                MapClearSearchMarker(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x77: 
            {
                MapClearAllMarker(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x78: 
            {
                MapFixBounds(jsonParamListObj);
                setNativeResult(jsonParamListObj, false);
                break;
            }

        case 0x90: 
            {
                ShowMap(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0x91: 
            {
                ShowUrl(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }
        case 0xA0: 
            {
                MapResize(jsonParamListObj);
                setNativeResult(jsonParamListObj, false);
                break;
            }       
        case 0xD1: 
            {
                MapDrawLine(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       
        case 0xD2: 
            {
                MapSetLineOptions(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       
        case 0xD3: 
            {
                MapRemoveLine(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       

        case 0xD7: 
            {
                MapDrawCircle(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       
        case 0xD8: 
            {
                MapSetCircleOptions(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       
        case 0xD9: 
            {
                MapRemoveCircle(jsonParamListObj);
                setNativeResult2(jsonParamListObj, true);
                break;
            }       

        default: 
            {
                setNativeResult2(jsonParamListObj, true);
                result = 'unknown';
            }
    }
}

function MapDrawLine(objparamme)
{
    var polyLineCoordinates = [];
    if (objparamme.PointList == null)
    {
    	return;
    }
    
    for( var i = 0; i < objparamme.PointList.length; i++ )
    {
        polyLineCoordinates[polyLineCoordinates.length] = new google.maps.LatLng(objparamme.PointList[i].lat, objparamme.PointList[i].lan)
    }
    
    var clr = objparamme.Options.strokeColor;
    var opa = parseFloat(objparamme.Options.strokeOpacity);
    var wt = parseInt(objparamme.Options.strokeWeight);
    var zind= parseInt(objparamme.Options.zIndex);

    var mappolyLine = new google.maps.Polyline({
      path: polyLineCoordinates,
      strokeColor: clr,
      strokeOpacity: opa,
      strokeWeight: wt,
    zIndex: zind
    });
   mappolyLine.setMap(map);

   glineList.push(mappolyLine);
   glineIdList.push(parseInt(objparamme.Options.Id));
}

function MapSetLineOptions(objparamme)
{
    var lineId = parseInt(objparamme.Options.Id);
    var mapline; 
    
    for (var i=0; i< glineIdList.length; i++)
    {
         if (glineIdList[i] == lineId)
         {
            mapline = glineList[i];
            break;
         }
    }
    
    var clr = objparamme.Options.strokeColor;
    var opa = parseFloat(objparamme.Options.strokeOpacity);
    var wt = parseInt(objparamme.Options.strokeWeight);
    var zind= parseInt(objparamme.Options.zIndex);

    var myopt = {
        strokeColor: clr,
        strokeOpacity: opa,
        strokeWeight: wt,
        zIndex: zind
     };

    
    if (mapline)
    {
        mapline.setOptions(myopt);
    }

}

function MapRemoveLine(objparamme)
{
    var lineId = parseInt(objparamme.Options.Id);
    var mapline; 
    
    for (var i=0; i< glineIdList.length; i++)
    {
         if (glineIdList[i] == lineId)
         {
            mapline = glineList[i];
            glineList[i] = null;
            glineIdList[i] = -1;
            break;
         }
    }

    if (mapline)
    {
        mapline.setMap(null);
    }

}


function MapRemoveCircle(objparamme)
{
    var circleId = parseInt(objparamme.Options.Id);
    var mapcircle; 
    for (var i=0; i< gCircleIdList.length; i++)
    {
         if (gCircleIdList[i] == circleId )
         {
            mapcircle = gCircleList[i];
            gCircleList[i] = null;
            gCircleIdList[i] = -1;
            break;
         }
    }

    if (mapcircle)
    {
        mapcircle.setMap(null);
    }

}

function MapSetCircleOptions(objparamme)
{
    var circleId = parseInt(objparamme.Options.Id);
    var mapcircle; 
    
    for (var i=0; i< gCircleIdList.length; i++)
    {
         if (gCircleIdList[i] == circleId )
         {
            mapcircle = gCircleList[i];
            break;
         }
    }

    var point = new google.maps.LatLng(parseFloat(objparamme.Point.lat), parseFloat(objparamme.Point.lan));
    var mrad = parseInt(objparamme.Options.radius);
    var clr = objparamme.Options.strokeColor;
    var opa = parseFloat(objparamme.Options.strokeOpacity);
    var wt = parseInt(objparamme.Options.strokeWeight);
    var zind= parseInt(objparamme.Options.zIndex);
    var fopa = parseFloat(objparamme.Options.fillOpacity);
    var fclr = objparamme.Options.fillColor;

    var myopt =
    {
            center: point,
            clickable: false,
            fillColor: fclr,
            fillOpacity:fopa,
            map:map,
            radius: mrad, 
            strokeColor:clr,
            strokeOpacity:opa,
            strokeWeight: wt,
            zIndex: zind
    };
    
    if (mapcircle)
    {
        mapcircle.setOptions(myopt);
    }
}

function MapDrawCircle(objparamme)
{
    var point = new google.maps.LatLng(parseFloat(objparamme.Point.lat), parseFloat(objparamme.Point.lan));
    var mrad = parseInt(objparamme.Options.radius);
    var clr = objparamme.Options.strokeColor;
    var opa = parseFloat(objparamme.Options.strokeOpacity);
    var wt = parseInt(objparamme.Options.strokeWeight);
    var zind= parseInt(objparamme.Options.zIndex);
    var fopa = parseFloat(objparamme.Options.fillOpacity);
    var fclr = objparamme.Options.fillColor;

var mapcircle = new google.maps.Circle(
            {
            center: point,
            clickable: false,
            fillColor: fclr,
            fillOpacity:fopa,
            map:map,
            radius: mrad, 
            strokeColor:clr,
            strokeOpacity:opa,
            strokeWeight: wt,
            zIndex: zind
            }); 
            
   gCircleList.push(mapcircle);
   gCircleIdList.push(parseInt(objparamme.Options.Id));
}

function jscallnativebinderOld(objparamme)
{
    var replacedString = objparamme;
    replacedString  = replacedString.replace( /&quot;/g, '"' );
//  alert(replacedString);

    var myJsonObj = eval('(' + replacedString + ')');
    googleMapAdapterTable(myJsonObj);
}

//--------------Initialize------------------

var gcurrentZoomlevel = 0;

function InitializeGoogleMapWithDetails(nativeParam, mapViewId)
{
    zoomChanged = false;
    var initZoom = parseInt(nativeParam.MapZoomLevel.level);
    var initialLat = parseFloat(nativeParam.MapCenter.lat);
    var initialLng = parseFloat(nativeParam.MapCenter.lan);
    var mapTypeId = parseInt(nativeParam.MapType.type);
    var mapType;

    if (mapTypeId == 0)
        mapType = google.maps.MapTypeId.ROADMAP;
    if (mapTypeId == 1)
        mapType = google.maps.MapTypeId.SATELLITE;
    if (mapTypeId == 2)
        mapType = google.maps.MapTypeId.HYBRID;


    if (initialLat >= 200.0)
    {
        initialLat = 0.0;
    }

    if (initialLng >= 200.0)
    {
        initialLng = 0.0;
    }

    if (initialLat == 0 && initialLng == 0)
    {
    
//      initialLat = 35.680551;
//      initialLng = 139.767208;
        initZoom = 2;
    }
    
    if (initZoom == 0)
    {
//      initZoom = 15;
    }
    
    initPoint = new google.maps.LatLng(initialLat, initialLng); 

    gcurrentZoomlevel = initZoom;

    var myOptions = 
    {
        zoom: initZoom,
        center: initPoint,
        mapTypeId: mapType,
        mapTypeControl: false,
        navigationControl: false,
        backgroundColor: 0x579500,
        disableDoubleClickZoom: true,
        draggableCursor:' ',
        draggingCursor:' ',
        keyboardShortcuts:false,
        scrollwheel:false,
        streetViewControl:false,
        scaleControl:false
    };
     map = new google.maps.Map(document.getElementById(mapViewId), myOptions);

     projectionHelper = new ProjectionHelper(map);

    sendStartEvent(nativeParam);


    google.maps.event.addListener(map, 'tilesloaded', function() 
    {
    
    if (bootintState == true)
    {
        setTimeout ( function()
        {
               cppContext.SetEventType(MapJSEventLoadFinished);
                cppContext.SetPoCId(2);
                cppContext.SetLoadFinished(1);
                cppContext.Serialize();
                if (bootintState)
                {
                bootintState=false;
                removeStaticMap();          
                }
        }, 2000 );
    }
    else
    {
           cppContext.SetEventType(MapJSEventLoadFinished);
            cppContext.SetPoCId(2);
            cppContext.SetLoadFinished(1);
            cppContext.Serialize();
            if (bootintState)
            {
                bootintState=false;
            removeStaticMap();          
            }
    }
            
       cppContext.SetEventType(15);
        var currentZoomlevel = map.getZoom();
        if (gcurrentZoomlevel != currentZoomlevel)
        {
            cppContext.SetZoom(gcurrentZoomlevel);
        cppContext.SetPoCId(3);
        cppContext.ForceSerialize();
        cppContext.SetEventType(0);
        }
            
        });   
        
    google.maps.event.addListener(map, 'dragstart', function() 
        {
            cppContext.SetLoadFinished(0);
        });   
        
    google.maps.event.addListener(map, 'dragend', function() 
        {
         setTimeout ( function()
        {
			cppContext.SetEventType(22);
			cppContext.SetPoCId(14);
			cppContext.ForceSerialize();
			cppContext.SetEventType(0);
	}, 200 );
        });   

//***
//    google.maps.event.addListener(map, 'click', function() 
//        {
//			cppContext.SetEventType(20);
//			cppContext.SetPoCId(14);
//			cppContext.Serialize();
//			cppContext.SetEventType(0);
//        });   
//
//    google.maps.event.addListener(map, 'dblclick', function() 
//        {
//			cppContext.SetEventType(21);
//			cppContext.SetPoCId(14);
//			cppContext.Serialize();
//			cppContext.SetEventType(0);
//        });   
//****

    google.maps.event.addListener(map, 'idle', function() 
    {
        if (bootintState)
        {
        bootintState=false;
        removeStaticMap();          
        }
    
        });   

    google.maps.event.addListener(map, 'maptypeid_changed', function() 
        {
                if (nativeParam.Function.Id == 0x11a)
                {
                cppContext.SetPoCId(4);
                cppContext.SetLoadFinished(1);
                cppContext.ForceSerialize();
            }
        });   

    google.maps.event.addListener(map, 'zoom_changed', function() 
    {
///     zoomChanged = true;
///     cppContext.SetEventType(16);
///     var currentZoomlevel = map.getZoom();
///     cppContext.SetZoom(currentZoomlevel);
///     cppContext.SetPoCId(5);
///     cppContext.ForceSerialize();
        });   

    google.maps.event.addListener(map, 'center_changed', function() 
    {
       cppContext.SetEventType(15);
        var latlang2 = map.getCenter();
        var currentZoomlevel = map.getZoom();
        if (currentZoomlevel != gcurrentZoomlevel && currentZoomlevel != 0)
        {
            cppContext.SetZoom(currentZoomlevel);
            gcurrentZoomlevel = currentZoomlevel;
            
        }
        else
        {
            cppContext.SetZoom(-1);
        }
        if (latlang2 != null)
        {
        cppContext.SetCenterLat(latlang2.lat());
        cppContext.SetCenterLng(latlang2.lng());
        cppContext.SetPoCId(6);
        cppContext.ForceSerialize();
	cppContext.SetAtomicId(0);
        cppContext.SetEventType(0);
        }
        
        setTimeout ( function()
        {
		var currentZoomlevel = map.getZoom();
		if (currentZoomlevel != gcurrentZoomlevel && currentZoomlevel != 0)
		{
			cppContext.SetZoom(currentZoomlevel);
			cppContext.SetEventType(16);
			cppContext.SetPoCId(2);
			cppContext.ForceSerialize();
			cppContext.SetAtomicId(0);
			cppContext.SetEventType(0);
		}
        }, 500 );
        
        });   

//***
//as of 11/2 direction service is not required
//     directionsService = new google.maps.DirectionsService();
//         directionsDisplay = new google.maps.DirectionsRenderer();
//         directionsDisplay.setMap(map);
    
//    var directionPolylineOpts =
//    {
//    clickable:false,
//    strokeColor:"#DD00FF",
//    strokeOpacity:0.7,
//    strokeWeight:5
//    };

//    var directionRendererOptions = 
//    {
//    draggable: false,
//    hideRouteList:true,
//    map:map,
//    preserveViewport: false,
//    routeIndex:0,
//    suppressBicyclingLayer:false,
//    suppressInfoWindows:true,
//    suppressMarkers:true,
//    polylineOptions :directionPolylineOpts,
//    suppressPolylines:false
//    };
    
//    directionsDisplay.setOptions(directionRendererOptions); 
//****

    for( var i = 0; i < nativeParam.MapMarkerList.length; i++ )
    {
        var initLat = nativeParam.MapMarkerList[i].lat;
        var initLang = nativeParam.MapMarkerList[i].lan;

        var iscenter = parseInt(nativeParam.MapMarkerList[i].center);
        if (iscenter)
        {
            var point2 = new google.maps.LatLng(initLat, initLang);
            map.setCenter(point2);
        }

        var dragable = false;//nativeParam.MapMarkerList[i].dragable;
        var iconId = parseInt(nativeParam.MapMarkerList[i].iconid);
        var imageurl;
        if (nativeParam.MapMarkerList[i].imageurl)
        {
            imageurl = nativeParam.MapMarkerList[i].imageurl;
            imageurlWidgth = MapDefaultIconWidthMax;
            imageurlHeight = MapDefaultIconHeightMax;
	}
        else
        {
            imageurl = navi_icons[iconId];
            imageurlWidgth = navi_icons_size[iconId].w;
            imageurlHeight = navi_icons_size[iconId].h;
        }
    
            
	var markerImage = new google.maps.MarkerImage(imageurl,
					new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
					null, 
					new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
					null);            
					
        var visibleparam = nativeParam.MapMarkerList[i].visible;
  
            var point = new google.maps.LatLng(parseFloat(initLat),parseFloat(initLang));
            var marker = new google.maps.Marker({
            position: point,
            map: map,
            icon: markerImage,
            clickable:true,
            cursor:' ',
            draggable:true,
            flat:false,
            title:'',
            shadow:IMG_FLAG_SHADOW
            });

            gmarkersList[gmarkersList.length] = marker;
            
            GlobalMarkerList[GlobalMarkerList.length] = new AttachedMarker(marker, nativeParam.MapMarkerList[i].Id, iconId);
            
            gCounter = gCounter + 1;
            gmarkersIdList[gmarkersIdList.length] = parseInt(nativeParam.MapMarkerList[i].Id);

            nativeParam.Error = 0;

            if (iconId == 10 ) //dragable flag iconid
            {
                attachMarkerId(marker, parseInt(nativeParam.MapMarkerList[i].Id), iconId, true);
            }
            else
            {
                attachMarkerId(marker, parseInt(nativeParam.MapMarkerList[i].Id), iconId, false);
            }
        
    }
//  nativeParam.MapMarker.visible = 1;
//  nativeParam.MapMarker.center = 0;
    
    var naviiconId = parseInt(nativeParam.MapMarker.iconid);
    
    if (naviiconId != 4 && naviiconId != 5)
    {
            MapShowNaviIcon(nativeParam, false);
    }
    
    var flagLat = parseFloat(nativeParam.Flag.lat);
    
    var flagLang = parseFloat(nativeParam.Flag.lan);

    if (flagLat != -200.0 && flagLang != -200.0)
    {
    var isflagcenter = parseInt(nativeParam.Flag.center);

    if (isflagcenter)
    {
        var point3 = new google.maps.LatLng(flagLat, flagLang);
        map.setCenter(point3);
    }

    var flagdrag;
    var flagdragable = parseInt(nativeParam.Flag.dragable);
    if (flagdragable == 1)
    {
        flagdrag = true;
    }
    else
    {
        flagdrag = false;
    }
    
    var flagiconId = parseInt(nativeParam.Flag.iconid);
    var flagimageurl;
    if (nativeParam.Flag.imageurl)
    {
        flagimageurl = nativeParam.Flag.imageurl;
        imageurlWidgth = MapDefaultIconWidthMax;
        imageurlHeight = MapDefaultIconHeightMax;
    }
    else
    {
        flagimageurl = navi_icons[flagiconId];
        imageurlWidgth = navi_icons_size[flagiconId].w;
        imageurlHeight = navi_icons_size[flagiconId].h;
    }


    var flagpoint = new google.maps.LatLng(parseFloat(flagLat),parseFloat(flagLang));
    
    var markerImage = new google.maps.MarkerImage(imageurl,
				new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
				null, 
				new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
				null);            

    var flagm = new google.maps.Marker({
        position: flagpoint,
        map: map,
        icon: markerImage,
        clickable:true,
        cursor:' ',
        draggable:true,
        flat:false,
        title:'',
        shadow:IMG_FLAG_SHADOW
        
    });

    gmarkersList[gmarkersList.length] = flagm;
    gCounter = gCounter + 1;
    gmarkersIdList[gmarkersIdList.length] = nativeParam.Flag.Id;

    GlobalMarkerList[GlobalMarkerList.length] = new AttachedMarker(flagm, 
    						MAP_IMPORT_FLAG_MARKER_ID,
    						nativeParam.Flag.Id);
    

    nativeParam.Error = 0;
    
    google.maps.event.addListener(flagm, 'click', function() 
    {
            cppContext.SetEventType(1);
        cppContext.SetMarker(flagm);
         cppContext.SetPoCId(7);
        cppContext.Serialize();
                cppContext.SetEventType(0);
        });   
    }


    if (selectCircle == null)
    {
        var selectCrlanchorPt = new google.maps.Point(74/2, 74/2);
        
        var selectCircleImg = new google.maps.MarkerImage(selectCircleImage, null, null,
                                                selectCrlanchorPt);
                                                
        var selectCirclePoint = new google.maps.LatLng(-180.0, -180.0);
        
        selectCircle = new google.maps.Marker({
        position: selectCirclePoint,
        map: map,
        icon: selectCircleImg,
        clickable:false,
        cursor:' ',
        draggable:false,
        flat:false,
        title:'',
        visible:false,
        zIndex: 1
        });
        
        delete selectCirclePoint;
    }

/////
//    var bounds = map.getBounds();
//    var southWest = bounds.getSouthWest();
//    var northEast = bounds.getNorthEast();
//    var lngSpan = northEast.lng() - southWest.lng();
//    var latSpan = northEast.lat() - southWest.lat();
//    var proj = map.getProjection();
//    proj.fromPointToLatLng();
/////

}
    
function InitializeGoogleMapFromWidget(nativeParam)
{
    var initZoom2 = parseInt(nativeParam.MapZoomLevel.level);
    var initLatitude2 = parseFloat(nativeParam.MapCenter.lat);
    var initLongitude2 = parseFloat(nativeParam.MapCenter.lan);
    var initType = parseInt(nativeParam.MapType.type);
    
    InitializeGoogleMap('mapview', initLatitude2,  initLongitude2, initZoom2, initType, nativeParam);
}
                
    
function InitializeGoogleMap(mapViewId, initLat, initLang, initZoom, mapTypeId, nativeParam)
{
    zoomChanged = false;

    var mapType;
    if (mapTypeId == 0)
        mapType = google.maps.MapTypeId.ROADMAP;
    if (mapTypeId == 1)
        mapType = google.maps.MapTypeId.SATELLITE;
    if (mapTypeId == 2)
        mapType = google.maps.MapTypeId.HYBRID;

    var initialLat = initLat;
    var initialLng = initLang;

    var initPoint;
    
    if (initialLat >= 200.0)
    {
        initialLat = 0.0;
    }

    if (initialLng >= 200.0)
    {
        initialLng = 0.0;
    }

    if (initialLat == 0 && initialLng == 0)
    {
    
//      initialLat = 35.680551;
//      initialLng = 139.767208;
        initZoom = 2;
    }
    
    if (initZoom == 0)
    {
//      initZoom = 15;
    }
    
    initPoint = new google.maps.LatLng(initialLat, initialLng); 


    var myOptions = 
    {
        zoom: initZoom,
        center: initPoint,
        mapTypeId: mapType,
        mapTypeControl: false,
        navigationControl: false,
        backgroundColor: 0x579500,
        disableDoubleClickZoom: true,
        draggableCursor:' ',
        draggingCursor:' ',
        keyboardShortcuts:false,
        scrollwheel:false,
        streetViewControl:false,
        scaleControl:false
    };

     sendStartEvent(nativeParam);

     map = new google.maps.Map(document.getElementById(mapViewId), myOptions);
     
     projectionHelper = new ProjectionHelper(map);

    google.maps.event.addListener(map, 'tilesloaded', function() 
    {
    
    if (bootintState == true)
    {
        setTimeout ( function()
        {
               cppContext.SetEventType(100);
                cppContext.SetPoCId(2);
                cppContext.SetLoadFinished(1);
                cppContext.Serialize();
                if (bootintState)
                {
                bootintState=false;
                removeStaticMap();          
                }
        }, 2000 );
    }
    else
    {
           cppContext.SetEventType(100);
            cppContext.SetPoCId(2);
            cppContext.SetLoadFinished(1);
            cppContext.Serialize();
            if (bootintState)
            {
                bootintState=false;
            removeStaticMap();          
            }
    }
    });

        
    google.maps.event.addListener(map, 'dragstart', function() 
        {
            cppContext.SetLoadFinished(0);
        });   
        
    google.maps.event.addListener(map, 'dragend', function() 
        {
        });   

    google.maps.event.addListener(map, 'idle', function() 
        {
        if (bootintState)
        {
        bootintState=false;
        removeStaticMap();          
        }
        });   

    google.maps.event.addListener(map, 'maptypeid_changed', function() 
        {
                if (nativeParam.Function.Id == 0x11a)
                {
                cppContext.SetPoCId(9);
                cppContext.SetLoadFinished(1);
                cppContext.ForceSerialize();
            }
        });   

    google.maps.event.addListener(map, 'center_changed', function() 
    {
       cppContext.SetEventType(15);
        var latlang2 = map.getCenter();
        var currentZoomlevel = map.getZoom();
        if (currentZoomlevel != 0)
        cppContext.SetZoom(currentZoomlevel);
        	else
        cppContext.SetZoom(-1);
        
        cppContext.SetCenterLat(latlang2.lat());
        cppContext.SetCenterLng(latlang2.lng());
        cppContext.SetPoCId(10);
        cppContext.ForceSerialize();
        cppContext.SetEventType(0);
        
        setTimeout ( function()
        {
		var currentZoomlevel = map.getZoom();
		if (currentZoomlevel != gcurrentZoomlevel && currentZoomlevel != 0)
		{
			cppContext.SetZoom(currentZoomlevel);
			cppContext.SetEventType(16);
			cppContext.SetPoCId(2);
			cppContext.ForceSerialize();
			cppContext.SetAtomicId(0);
			cppContext.SetEventType(0);
		}
        }, 500 );
        
        });   

//****
// as of 2/11 direction service is not used
//     directionsService = new google.maps.DirectionsService();
//         directionsDisplay = new google.maps.DirectionsRenderer();
//         directionsDisplay.setMap(map);
    
//    var directionPolylineOpts =
//    {
//    clickable:false,
//    strokeColor:"#DD00FF",
//    strokeOpacity:0.7,
//    strokeWeight:5
//    };
    
//    var directionRendererOptions = 
//    {
//    draggable: false,
//    hideRouteList:true,
//    map:map,
//    preserveViewport: false,
//    routeIndex:0,
//    suppressBicyclingLayer:false,
//    suppressInfoWindows:true,
//    suppressMarkers:true,
//    polylineOptions :directionPolylineOpts,
//    suppressPolylines:false
//    };
//    
//    directionsDisplay.setOptions(directionRendererOptions); 
//****

    var flagLat = parseFloat(nativeParam.Flag.lat);
    
    var flagLang = parseFloat(nativeParam.Flag.lan);

    if (flagLat != -200.0 && flagLang != -200.0)
    {
        var isflagcenter = parseInt(nativeParam.Flag.center);

        if (isflagcenter)
        {
            var point3 = new google.maps.LatLng(flagLat, flagLang);
            map.setCenter(point3);
        }

        var flagdrag;
        var flagdragable = parseInt(nativeParam.Flag.dragable);
        if (flagdragable == 1)
        {
            flagdrag = true;
        }
        else
        {
            flagdrag = false;
        }
    
        var flagiconId = 0;//parseInt(nativeParam.Flag.iconid);
        var flagimageurl;
        if (nativeParam.Flag.imageurl)
        {
            flagimageurl = nativeParam.Flag.imageurl;
   	    imageurlWidgth = MapDefaultIconWidthMax;
	    imageurlHeight = MapDefaultIconHeightMax;
        }
        else
        {
            flagimageurl = navi_icons[flagiconId];
            imageurlWidgth = navi_icons_size[flagiconId].w;
            imageurlHeight = navi_icons_size[flagiconId].h;
        }

   
    var markerImage = new google.maps.MarkerImage(imageurl,
				new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
				null, 
				new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
				null);            


        var flagpoint = new google.maps.LatLng(parseFloat(flagLat),parseFloat(flagLang));

            var flagm = new google.maps.Marker({
            position: flagpoint,
            map: map,
            icon: markerImage,
            clickable:true,
            cursor:' ',
            draggable:true,
            flat:false,
            title:'',
            shadow:IMG_FLAG_SHADOW
            });

        gmarkersList[gmarkersList.length] = flagm;
        gCounter = gCounter + 1;
        gmarkersIdList[gmarkersIdList.length] = MAP_IMPORT_FLAG_MARKER_ID;
        
        GlobalMarkerList[GlobalMarkerList.length] = new AttachedMarker(flagm, 
        						MAP_IMPORT_FLAG_MARKER_ID,
        						flagiconId);

        nativeParam.Error = 0;
	
	attachMarkerId(flagm, MAP_IMPORT_FLAG_MARKER_ID, flagiconId, true);

    }
     if (selectCircle == null)
     {
         var selectCrlanchorPt = new google.maps.Point(74/2, 74/2);
         
         var selectCircleImg = new google.maps.MarkerImage(selectCircleImage, null, null,
                                                 selectCrlanchorPt);
                                                 
         var selectCirclePoint = new google.maps.LatLng(-180.0, -180.0);
         
         selectCircle = new google.maps.Marker({
         position: selectCirclePoint,
         map: map,
         icon: selectCircleImg,
         clickable:false,
         cursor:' ',
         draggable:false,
         flat:false,
         title:'',
         visible:false,
         zIndex: 1
         });
         
         delete selectCirclePoint;
     }

    
}

//--------------Marker------------------

  function MapAddMarkerList(nativeParam)
  {
    var fixMarkerBounds = true;
    var selectedMarker = -1;
    
    if (nativeParam.Function.FitBounds)
    {
    	var fbounds = parseInt(nativeParam.Function.FitBounds);
    	if (fbounds == 1)
    		fixMarkerBounds = true;
	else
    		fixMarkerBounds = false;
	
    }

    if (nativeParam.Function.Selcted)
    {
    	var fselect = parseInt(nativeParam.Function.Selcted);
    }
    
    var latlngmarkerbounds = new google.maps.LatLngBounds();
  
    for( var i = 0; i < nativeParam.MapMarkerList.length; i++ )
    {
        var initLat = nativeParam.MapMarkerList[i].lat;
        var initLang = nativeParam.MapMarkerList[i].lan;

        var iscenter = parseInt(nativeParam.MapMarkerList[i].center);
        if (iscenter)
        {
            var point2 = new google.maps.LatLng(initLat, initLang);
            map.setCenter(point2);
        }

        var dragable = false;//nativeParam.MapMarkerList[i].dragable;
        var iconId = parseInt(nativeParam.MapMarkerList[i].iconid);
        var imageurl;
    
        if (iconId == 7)
        {
            iconId = 9;
        }
        
        if (iconId == 10)
        {
			dragable = true;
			fixMarkerBounds = false;
        }

        if (nativeParam.MapMarkerList[i].imageurl)
        {
            imageurl = nativeParam.MapMarkerList[i].imageurl;
       	    imageurlWidgth = MapDefaultIconWidthMax;
    	    imageurlHeight = MapDefaultIconHeightMax;
		}
        else
        {
			imageurl = navi_icons[iconId];
			imageurlWidgth = navi_icons_size[iconId].w;
			imageurlHeight = navi_icons_size[iconId].h;
        }

        var markerImage = new google.maps.MarkerImage(imageurl,
    				new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
    				null, 
    				new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
    				null);            

    
        var visibleparam = nativeParam.MapMarkerList[i].visible;
  
            var point = new google.maps.LatLng(parseFloat(initLat),parseFloat(initLang));
            var marker = new google.maps.Marker({
            position: point,
            map: map,
            icon: markerImage,
            clickable:true,
            cursor:' ',
            draggable:dragable,
            flat:false,
            title:'',
            shadow:IMG_FLAG_SHADOW
            });

            gmarkersList[gmarkersList.length] = marker;
            gCounter = gCounter + 1;
            gmarkersIdList[gmarkersIdList.length] = parseInt(nativeParam.MapMarkerList[i].Id);
            nativeParam.Error = 0;
	
	    GlobalMarkerList[GlobalMarkerList.length] = new AttachedMarker(marker, 
    						nativeParam.MapMarkerList[i].Id,
    						iconId);
            
            if (iconId == 10 ) //dragable flag iconid
            {
                attachMarkerId(marker, parseInt(nativeParam.MapMarkerList[i].Id), iconId, true);
            }
            else
            {
                attachMarkerId(marker, parseInt(nativeParam.MapMarkerList[i].Id), iconId, false);
            }
            
              
        latlngmarkerbounds.extend(marker.getPosition());
        
    }
    
    if (fixMarkerBounds)
    {
        map.setCenter(latlngmarkerbounds.getCenter());
        map.fitBounds(latlngmarkerbounds); 
        var fullscreenZoom = map.getZoom();

	if (fullscreenZoom > 2)
	{
	   map.setZoom(fullscreenZoom-1)
	}
        
    }
    
     cppContext.SetPoCId(12);
    cppContext.Serialize();
  
  }

function attachMarkerId(marker, number, icon, dragableFlag) 
{
	var markerId = number;
	var iconId = icon;
	
	if (dragableFlag == true)
	{
		google.maps.event.addListener(marker, 'mousedown', function() 
		{
			if (selectCircle)
			{
				selectCircle.setVisible(false);
			}

			marker.setIcon(IMG_FLAG_DUMMY);
			marker.setShadow(null);
			var mlatlng  = marker.getPosition();
		    var divPixel = fromLatLngToPixel(mlatlng);
			cppContext.SetScreenX(divPixel.x);
			cppContext.SetScreenY(divPixel.y);
			cppContext.SetEventType(3);
			cppContext.SetMarkerId(markerId);
			cppContext.SetPoCId(13);
			cppContext.Serialize();
			cppContext.SetEventType(0);
	    });   

    	google.maps.event.addListener(marker, 'mouseup', function() 
		{
		    var mlatlng  = marker.getPosition();
		    var divPixel = fromLatLngToPixel(mlatlng);
			cppContext.SetScreenX(divPixel.x);
			cppContext.SetScreenY(divPixel.y);
			cppContext.SetCenterLat(mlatlng.lat());
			cppContext.SetCenterLng(mlatlng.lng());
			cppContext.SetEventType(4);
			cppContext.SetMarkerId(markerId);
			cppContext.SetPoCId(14);
			cppContext.Serialize();
			cppContext.SetEventType(0);

			setTimeout ( function()
			{
				imageurl = navi_icons[iconId];
				imageurlWidgth = navi_icons_size[iconId].w;
				imageurlHeight = navi_icons_size[iconId].h;

		        var markerImage = new google.maps.MarkerImage(
											imageurl,
											new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
											null, 
											new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
											null);            

				marker.setIcon(markerImage);

				marker.setShadow(IMG_FLAG_SHADOW);
				cppContext.SetPoCId(15);
				cppContext.SetEventType(1);
				cppContext.SetMarkerId(markerId);
				cppContext.Serialize();
				cppContext.SetEventType(0);

				if (selectCircle)
				{
					selectCircle.setPosition(marker.getPosition());
					selectCircle.setVisible(true);
				}
			}, 150);
		});   

		google.maps.event.addListener(marker, 'position_changed', function() 
		{
			var mlatlng = marker.getPosition();
			cppContext.SetCenterLat(mlatlng.lat());
			cppContext.SetCenterLng(mlatlng.lng());
			cppContext.SetEventType(5);
			cppContext.SetMarkerId(markerId);
			cppContext.SetPoCId(142);
			cppContext.Serialize();
			cppContext.SetEventType(0);

			if (selectCircle)
			{
				selectCircle.setPosition(marker.getPosition());
				selectCircle.setVisible(true);
			}
		});   

		if (selectCircle)
		{
			selectCircle.setPosition(marker.getPosition());
			selectCircle.setVisible(true);
		}
	}
	else
	{
		google.maps.event.addListener(marker, 'click', function() 
		{
			if (selectCircle)
			{
			    selectCircle.setPosition(marker.getPosition());
			    selectCircle.setVisible(true);
			}
			setTimeout ( function()
			{
				cppContext.SetPoCId(15);
				cppContext.SetEventType(1);
				cppContext.SetMarkerId(markerId);
				cppContext.Serialize();
				cppContext.SetEventType(0);
			}, 700 );
		});

		google.maps.event.addListener(marker, 'mousedown', function() 
		{
			cppContext.SetEventType(MapJSEventMarkerMouseDownOthers);
			cppContext.SetMarkerId(markerId);
			cppContext.SetPoCId(13);
			cppContext.ForceSerialize();
			cppContext.SetEventType(0);
		});   
	}
    
}


function attachDirectionMarkerId(marker, number) 
{
  var markerId = number;
  
  google.maps.event.addListener(marker, 'click', function() 
  {
        gUpdateSerialize = true;
         cppContext.SetPoCId(16);
        cppContext.SetEventType(2);
        cppContext.SetMarkerId(markerId);
        cppContext.Serialize();
        cppContext.SetEventType(0);
  });
}


  function MapRemoveMarker(nativeParam)
  {
   for(var i=0; i<gmarkersIdList.length; i++)
   { 
    if (gmarkersIdList[i] == nativeParam.MapMarker.Id)
    {
        if (gmarkersList[i])
            gmarkersList[i].setMap(null); 
    }
   }
}


  function MapAddMarkerWithImage(nativeParam)
  {
    var fixMarkerBounds;


    var initLat = nativeParam.MapMarker.lat;
    
    var initLang = nativeParam.MapMarker.lan;

    var showpopup = parseInt(nativeParam.MapMarker.showpopup);

    var iscenter = parseInt(nativeParam.MapMarker.center);
    if (iscenter)
    {
        var point2 = new google.maps.LatLng(initLat, initLang);
        map.setCenter(point2);
    }

    var dragable = parseInt(nativeParam.MapMarker.dragable);
    var iconId = parseInt(nativeParam.MapMarker.iconid);
    
    var dragF = false;
    
    if (dragable == 1)
    {
        dragF = true;
    }
    
    if (iconId == 7)
    {
        iconId = 9;
    }
    
    if (iconId == 10)
    {
        fixMarkerBounds = false;
    }

        
    var imageurl;
    if (nativeParam.MapMarker.imageurl)
    {
        imageurl = nativeParam.MapMarker.imageurl;
        imageurlWidgth = MapDefaultIconWidthMax;
        imageurlHeight = MapDefaultIconHeightMax;
    }
    else
    {
        imageurl = navi_icons[iconId];
	imageurlWidgth = navi_icons_size[iconId].w;
	imageurlHeight = navi_icons_size[iconId].h;
    }
    
        var markerImage = new google.maps.MarkerImage(imageurl,
    				new google.maps.Size(imageurlWidgth, imageurlHeight*2), 
    				null, 
    				new google.maps.Point(imageurlWidgth/2, imageurlHeight), 
    				null);            

    var visibleparam = nativeParam.MapMarker.visible;
    var popstring = nativeParam.MapMarker.popup;
    
     var boxText = document.createElement("div");
       boxText.style.cssText = " margin-top: 20px;  margin-left: 20px; padding: 5px; color:white; font-family:verdana; font-weight:bold; font-size:16";
 
        boxText.innerHTML = popstring;
  
    var point = new google.maps.LatLng(parseFloat(initLat),parseFloat(initLang));
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: markerImage,
        clickable:true,
        cursor:' ',
        draggable:dragF,
        flat:false,
        title:'',
        shadow:IMG_FLAG_SHADOW
    });

    gmarkersList[gmarkersList.length] = marker;
    gCounter = gCounter + 1;
    gmarkersIdList[gmarkersIdList.length] = nativeParam.MapMarker.Id;
    
    GlobalMarkerList[GlobalMarkerList.length] = new AttachedMarker(marker, 
					nativeParam.MapMarker.Id,
					iconId);
    
     var myOptions = 
     {
                 content: boxText
                ,disableAutoPan: true //false
                ,maxWidth: 0
        ,pixelOffset: new google.maps.Size(-140, -150)
                ,zIndex: null
                ,boxStyle: { 
                   background: "url('image/popup/Map_fukidashi_info.png') no-repeat"
          ,opacity: 0.7
          ,width: "280px"
          ,height: "100px"
                  
                 }
                ,closeBoxMargin: "2px 12px 12px 12px"
                ,closeBoxURL: "image/popup/Map_Fukidashi_InfomationIcon.png"
                ,infoBoxClearance: new google.maps.Size(1, 1)
                ,isHidden: false
                ,pane: "floatPane"
                ,enableEventPropagation: false
        };

    var ib = new InfoBox(myOptions);                
//        ib.open(map, marker);
//        if (showpopup == false)
//          ib.close();

    gpopupList[gpopupList .length] = ib;
    
    nativeParam.Error = 0;

    if (iconId == 10 ) //dragable flag iconid
    {
        attachMarkerId(marker, parseInt(nativeParam.MapMarker.Id), iconId, true);
    }
    else
    {
        attachMarkerId(marker, parseInt(nativeParam.MapMarker.Id), iconId, false);
    }
    
    
// replacing with attachMarkerId    
//? google.maps.event.addListener(marker, 'click', function() 
//? {
//?         cppContext.SetEventType(1);
//?     cppContext.SetMarker(marker);
//?     if (gpopupOpen == true)
//?     {
//              ib.close();
//?         gpopupOpen = false;
//?         }
//?         else
//?         {
//              ib.open(map, marker);
//?         gpopupOpen = true;
//?     }
//?      cppContext.SetPoCId(10);
//?     cppContext.Serialize();
//?                cppContext.SetEventType(0);
//?     
//?     });   

    
    if (fixMarkerBounds)
    {
//      MapFixBounds();
    }
  }

//--------------NaviIcon------------------

function MapShowNaviIcon(nativeParam, isInit)
{
    var lat = parseFloat(nativeParam.MapMarker.lat);
    var lon = parseFloat(nativeParam.MapMarker.lan);
    var visibleParam = parseInt(nativeParam.MapMarker.visible);
    var centerParam = parseInt(nativeParam.MapMarker.center);
    var iconId = parseInt(nativeParam.MapMarker.iconid);
    var point = new google.maps.LatLng(lat, lon);

    var imageurl = navi_icons[iconId];
    var shadowUrl = null;

    var visibleFlag;
    var isNavi = false;
    if (visibleParam == 1)
    {
        visibleFlag = true;
        isNavi = true;
    }
    else
    {
        visibleFlag = false;
        isNavi = false;
    }
    
    currentIconId = iconId;
    var mimage;
    if (navi_marker[iconId] == null)
    {
		mimage = new google.maps.MarkerImage(imageurl,
		                        null,
		                        null,
		                        new google.maps.Point(accurecyAdjust[iconId]/2,accurecyAdjust[iconId]/2),
		                        null); 

        navi_marker[iconId] = new google.maps.Marker(
        {
            position: point,
            map: map,
            icon: mimage,
            shadow: shadowUrl,
            clickable:true,
            cursor:' ',
            draggable:false,
            flat:false,
            visible:visibleFlag,
            title:''
        });
        
		var finishEvent = false;
		if (iconId == 4 || iconId == 5)
		{
			navi_marker[iconId].setVisible(false);
			finishEvent = true;
			if (current_navi)
			{
			    current_navi.setVisible(false);
			}
		        
			if (accuracy_circle != null )
			{
			    accuracy_circle.setRadius(0);
			}
		}

	    current_navi = navi_marker[iconId];
    
		google.maps.event.addListener(current_navi, 'click', function() 
		{
			gUpdateSerialize = true;
			cppContext.SetEventType(1);
			cppContext.SetMarkerId(-5);
			cppContext.SetPoCId(17);
			cppContext.Serialize();
			cppContext.SetEventType(0);
		});   

		google.maps.event.addListener(current_navi, 'mousedown', function() 
		{
			cppContext.SetEventType(MapJSEventMarkerMouseDownOthers);
			cppContext.SetMarkerId(-5);
			cppContext.SetPoCId(13);
			cppContext.ForceSerialize();
			cppContext.SetEventType(0);
		});   
        
		switch (iconId)
		{
			case 1: 
			{
			break;
			}
			case 2: 
			{
			break;
			}
			case 3: 
			{
			break;
			}
			case 4: 
			{
			break;
			}
			case 5: 
			{
			break;
			}
			case 6: 
			{
			break;
			}
		}
    }
    else
    {
		if (iconId == 4 || iconId == 5)
		{
			finishEvent = true;
			if (current_navi)
			{
				current_navi.setVisible(false);
			}
			if (accuracy_circle != null )
			{
			    accuracy_circle.setRadius(0);
			}
		}

		current_navi = navi_marker[iconId];

		if (visibleParam == 1 && iconId != 5)
		{
		    navi_marker[iconId].setVisible(true);
		}
		else
		{
		    navi_marker[iconId].setVisible(false);
			if (accuracy_circle != null )
			{
			    accuracy_circle.setRadius(0);
			}
		    
		}
	}

    if (current_navi != null)
    {
//      current_navi.setVisible(false);
    }

/// if (&& visibleParam == 1)
    if (centerParam == 1 && visibleParam == 1)
    {
		var serializeRet = false;
		if (map && map.getBounds())
		{
			if (map.getBounds().contains(point))
			serializeRet = true;
		}

		map.panTo(point);
		current_navi.setPosition(map.getCenter());

		if (serializeRet)
		   setNativeResult(nativeParam, true);
    }
    else
    {
		current_navi.setPosition(point);
		finishEvent = true;
    }
    
    if (accuracy_circle != null && visibleParam == 0)
    {
		accuracy_circle.setRadius(0);
    }

    isNavigationEnabled = isNavi;       
    
    if (finishEvent && isInit)
    {
		setNativeResult(nativeParam, true);
    }
}


function MapAddDirecationMarker(initLat, initLang, imageurl, scaleflag, popstr)
{
    var point2 = new google.maps.LatLng(initLat, initLang);

    var dragable = false;
    
    var visibleparam = true;
    var popstring = popstr;
    
     var boxText = document.createElement("div");
       boxText.style.cssText = " margin-top: 20px;  margin-left: 20px; padding: 5px; color:white; font-family:verdana; font-weight:bold; font-size:16";
 
        boxText.innerHTML = popstring;
  
    var sz1;
    if (scaleflag == true)
    {
        sz1 = new google.maps.Size(30, 30);
    }
    else
    {
        sz1=null;
    }
    var mimage = new google.maps.MarkerImage(imageurl,
                                    null,
                                    null,
                                    null,
                                    sz1); 
 
    var point = new google.maps.LatLng(parseFloat(initLat),parseFloat(initLang));
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: mimage,
        clickable:true,
        cursor:' ',
        draggable:false,
        flat:false,
        title:''
    });

    gdmarkersList[gdmarkersList.length] = marker;

     var myOptions = 
     {
                 content: boxText
                ,disableAutoPan: false
                ,maxWidth: 0
        ,pixelOffset: new google.maps.Size(-140, -150)
                ,zIndex: null
                ,boxStyle: { 
                   background: "url('image/popup/Map_fukidashi_info.png') no-repeat"
          ,opacity: 0.7
          ,width: "280px"
          ,height: "100px"
                  
                 }
                ,closeBoxMargin: "2px 12px 12px 12px"
                ,closeBoxURL: "image/popup/Map_Fukidashi_InfomationIcon.png"
                ,infoBoxClearance: new google.maps.Size(1, 1)
                ,isHidden: false
                ,pane: "floatPane"
                ,enableEventPropagation: false
        };

      var ib = new InfoBox(myOptions);                
//        ib.open(map, marker);
//        ib.close();
      gdpopupList[gdpopupList.length] = ib;

    direction_marker.push({marker:marker, popup:ib});
//  ib.open(map, marker);
//  ib.close();
        direction_marker[directionStep].popup.open(map, marker);
        if (scaleflag == true)
        direction_marker[directionStep].popup.close();
        directionStep = directionStep + 1;
    
    attachDirectionMarkerId(marker, directionStep);

/// google.maps.event.addListener(marker, 'click', function() 
/// {
///     gUpdateSerialize = true;
///         cppContext.SetEventType(2);
///
///        for(var i=0; i<gdmarkersList.length; i++)
///        { 
///         if (gdmarkersList[i] == marker)
///         {
///             cppContext.SetMarkerId(i);
///         }
///        }
///
///     if (gpopupOpen == true)
///     {
//                  ib.close();
///         gpopupOpen = false;
///         }
///         else
///         {
//                  ib.open(map, marker);
///         gpopupOpen = true;
///     }
///     cppContext.SetPoCId(11);
///     cppContext.Serialize();
///             cppContext.SetEventType(0);
///     });   
}


//---------------------posupdate-------------------------

function MapUpdatePositioning(nativeParam)
{
    if (isNavigationEnabled == false)
        return;
        
    var lat = parseFloat(nativeParam.Position.lat);
    var lon = parseFloat(nativeParam.Position.lan);
    var point = new google.maps.LatLng(lat, lon);
    var moveCenter = parseInt(nativeParam.MapMarker.center);

    var iconId = parseInt(nativeParam.MapMarker.iconid);
    if (currentIconId == -1 || currentIconId != iconId) 
      return;

//  if ( map.getBounds().contains(point) == false)
//      map.panTo(point);
    
    if (moveCenter == 1)
    {
        map.panTo(point);
    }
    else
    {
        setNativeResult2(nativeParam, true);
    }
    
    var accurecy = parseInt(nativeParam.MapMarker.a);
    accurecy = accurecy + accurecyAdjust[iconId];
    switch (iconId)
    {
        case 1: 
            {
                if (accuracy_circle == null)
                {
                    accuracy_circle = new google.maps.Circle(
                        {radius: accurecy, 
                         map:map,
                         center: point
                         }); 
                }
                var myopt =
                {
                center:point, 
                strokeColor:"#00AAFF",
                fillColor:"#00AAFF",
                fillOpacity:0.6
                };
                accuracy_circle.setOptions(myopt);
                if (accuracy_circle != null )
                {
                    if (accuracy_circle.getRadius() == 0 || accuracy_circle.getRadius() != accurecy)
                    {
                        accuracy_circle.setRadius(accurecy);
                    }
                }
            break;
            }
        case 2: 
            {
                if (accuracy_circle == null)
                {
                    accuracy_circle = new google.maps.Circle(
                        {radius: accurecy, 
                         map:map,
                         center: point
                         }); 
                }
                var myopt =
                {
                center:point, 
                strokeColor:"#FFAA00",
                fillColor:"#FFAA00",
                fillOpacity:0.6
                };
                accuracy_circle.setOptions(myopt );
                if (accuracy_circle != null )
                {
                    if (accuracy_circle.getRadius() == 0 || accuracy_circle.getRadius() != accurecy)
                    {
                        accuracy_circle.setRadius(accurecy);
                    }
                }
            break;
            }
        case 3: 
            {
                if (accuracy_circle == null)
                {
                    accuracy_circle = new google.maps.Circle(
                        {radius: accurecy, 
                         map:map,
                         center: point
                         }); 
                }
                var myopt =
                {
                center:point, 
                strokeColor:"#00AAFF",
                fillColor:"#00AAFF",
                fillOpacity:0.6
                };
                accuracy_circle.setOptions(myopt);
                if (accuracy_circle != null )
                {
                    if (accuracy_circle.getRadius() == 0 || accuracy_circle.getRadius() != accurecy)
                    {
                        accuracy_circle.setRadius(accurecy);
                    }
                }
            break;
            }
        case 4: 
            {
            break;
            }
        case 5: 
            {
            break;
            }
        case 6: 
            {
            break;
            }
    }
    if (current_navi != null)
    {
        movePoint = point;
        if (moveCenter)
        {
            if (map && map.getBounds())
            {
                if (map.getBounds().contains(movePoint))
                {
                    setNativeResult(nativeParam, true);
                }
            }

            map.panTo(movePoint);
            current_navi.setPosition(movePoint);

//      setTimeout("",1250);
        }
        else
        {
            current_navi.setPosition(movePoint);
            if (accuracy_circle != null )
            {
// as per bug 16796 do not set remove accurecy circle
//                accuracy_circle.setRadius(0);
            }
            setNativeResult(nativeParam, true);
        }
    }

     if (point)
	delete point;
    
}

function MapUpdatePositioningWithHeading(nativeParam)
{
    if (isNavigationEnabled == false)
        return;
        
    var lat = parseFloat(nativeParam.Position.lat);
    var lon = parseFloat(nativeParam.Position.lan);
    var point = new google.maps.LatLng(lat, lon);
    var iconId = parseInt(nativeParam.MapMarker.iconid);
    if (currentIconId == -1 || currentIconId != iconId) 
    {
      delete point;
      return;
    }

    if ( map.getBounds().contains(point) == false)
        map.panTo(point);

    if (current_navi != null)
    {
        current_navi.setPosition(point);
    }
    
    delete point;
}

function MapAddDirecationMarker2(initLat, initLang, imageurl, scaleflag, popstr)
{
    var sz1;
    if (scaleflag == true)
    {
        sz1 = new google.maps.Size(30, 30);
    }
    else
    {
        sz1=null;
    }
    var mimage = new google.maps.MarkerImage(imageurl,
                                    null,
                                    null,
                                    null,
                                    sz1); 
                                    
    var point = new google.maps.LatLng(parseFloat(initLat),parseFloat(initLang));
    var directionPoint = new google.maps.Marker({
    position: point,
    map: map,
    icon: mimage,
    clickable:false,
    cursor:' ',
    draggable:false,
    flat:false,
    title:''
    });
}

function MapAddDirecationStartMarker(initLat, initLang, popstr)
{
    startDirStep = directionStep;
    MapAddDirecationMarker(initLat, initLang, 'image/flags/Map_Flag_green.png', false, popstr);
}

function MapAddDirecationEndMarker(initLat, initLang, popstr)
{
    endDirStep = directionStep;
    MapAddDirecationMarker(initLat, initLang, 'image/flags/Map_Flag_red.png', false, popstr);
}

function MapAddDirecationCorner(initLat, initLang, popstr)
{
    MapAddDirecationMarker(initLat, initLang, 'image/direction/Map_corn.png', true, popstr);
}


//see http://code.google.com/apis/maps/documentation/utilities/polylinealgorithm.html
// for algorithm

function decodeLine (encoded) 
{
  if (encoded == null)
    return;
  var len = encoded.length;
  var index = 0;
  var array = [];
  var lat = 0;
  var lng = 0;

  while (index < len) 
  {
    var b;
    var shift = 0;
    var result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
    if (index>=len)
    {
    break;
    }
      
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
    if (index>=len)
    {
    break;
    }
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    array.push([lat * 1e-5, lng * 1e-5]);
  }

  return array;
}

// Decode an encoded levels string into a list of levels.
function decodeLevels(encoded) 
{
  enc_levels = [];
  var maxLevel = 0;
  if (encoded == null) return;
  for (var pointIndex = 0; pointIndex < encoded.length; ++pointIndex) {
    var pointLevel = encoded.charCodeAt(pointIndex) - 63;
    if (maxLevel < pointLevel)
        maxLevel = pointLevel;
    enc_levels.push(pointLevel);
  }

}

/////////////////
com = {redfin: {}};

com.redfin.FastMarkerOverlay = function(map, markers) {
  this.setMap(map);
  this._markers = markers;
}

com.redfin.FastMarkerOverlay.prototype = new google.maps.OverlayView();

com.redfin.FastMarkerOverlay.prototype.onAdd = function() 
{
  this._div = document.createElement("div");
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(this._div);
}

com.redfin.FastMarkerOverlay.prototype.copy = function(map) 
{
  var markers = this._markers;
  var i = markers.length;
  var markersCopy = new Array(i);
  while (i--) {
    markersCopy[i] = markers[i].copy();
  }
  return new com.redfin.FastMarkerOverlay(map, markers);
};

com.redfin.FastMarkerOverlay.prototype.draw = function() 
{
  // if already removed, never draw
  if (!this._div) return;
  
  var overlayProjection = this.getProjection();

  var i = this._markers.length;
  var textArray = [];
  while (i--) {
    var marker = this._markers[i];
    var divPixel = overlayProjection.fromLatLngToDivPixel(marker._latLng);
    textArray.push("<div style='position:absolute; left:");
    textArray.push(divPixel.x + marker._leftOffset);
    textArray.push("px; top:");
    textArray.push(divPixel.y + marker._topOffset);
    textArray.push("px;")
    if (marker._zIndex) {
      textArray.push(" z-index:");
      textArray.push(marker._zIndex);
      textArray.push(";");
    }
    textArray.push("'");
    if (marker._divClassName) {
      textArray.push(" class='");
      textArray.push(marker._divClassName);
      textArray.push("'");
    }
    textArray.push(" id='");
    textArray.push(marker._id);
    textArray.push("' >");

    var markerHtmlArray = marker._htmlTextArray;
    var j = markerHtmlArray.length;
    var currentSize = textArray.length;
    while (j--) {
      textArray[j + currentSize] = markerHtmlArray[j];
    }
    textArray.push("</div>");
  }
  
  //Insert the HTML into the overlay
  this._div.innerHTML = textArray.join('');
}

/** Hide all of the markers */
com.redfin.FastMarkerOverlay.prototype.hide = function() {
  if (!this._div) return;
  this._div.style.display = "none";
}

/** Show all of the markers after hiding them */
com.redfin.FastMarkerOverlay.prototype.unhide = function() {
  if (!this._div) return;
  this._div.style.display = "block";
}

/** Remove the overlay from the map; never use the overlay again after calling this function */
com.redfin.FastMarkerOverlay.prototype.onRemove = function() {
  this._div.parentNode.removeChild(this._div);
  this._div = null;
}


com.redfin.FastMarker = function(id, latLng, htmlTextArray, divClassName, zIndex, leftOffset, topOffset) {
  this._id = id;
  this._latLng = latLng;
  this._htmlTextArray = htmlTextArray;
  this._divClassName = divClassName;
  this._zIndex = zIndex;
  this._leftOffset = leftOffset || 0;
  this._topOffset = topOffset || 0;
}

com.redfin.FastMarker.prototype.copy = function() {
  var htmlArray = this._htmlTextArray;
  var i = htmlArray.length;
  var htmlArrayCopy = new Array(i);
  while (i--) {
    htmlArrayCopy[i] = htmlArray[i];
  }
  return new com.redfin.FastMarker(this._id, latLng, htmlArrayCopy, this._divClassName, this._zIndex, this._leftOffset, this._topOffset);
}
/////////////////

function onClickConeMarker(stepIndex)
{
    gUpdateSerialize = true;
     cppContext.SetPoCId(16);
    cppContext.SetEventType(2);
    cppContext.SetMarkerId(stepIndex);
    cppContext.ForceSerialize();
    cppContext.SetEventType(0);
 }

function MapAddDirecationCornerFast(initLat, initLang, fastMarkers)
{
    var latlng = new google.maps.LatLng(initLat, initLang);

    var dragable = false;
    
    var visibleparam = true;
    var scaleflag = false;
    
    var sz1;
    if (scaleflag == true)
    {
        sz1 = new google.maps.Size(30, 30);
    }
    else
    {
        sz1=null;
    }
        directionStep = directionStep + 1;

    var marker = new com.redfin.FastMarker(directionStep, latlng, ["<div class='coneCorner'  onclick='onClickConeMarker(", directionStep,")'>&nbsp;</div>"], null);
    fastMarkers.push(marker);

    attachDirectionMarkerId(marker, directionStep);

}



 function createPoint(lat, lng, pLevel) 
 {
 
   var newPoint = {
     Latitude: lat,
     Longitude: lng,
     Level: pLevel
   };

 var latlngPoint = new  google.maps.LatLng(lat, lng);


  points.push(newPoint);
  paths.push(latlngPoint);
  
}

function addDirectionMarkers()
{
    var fastMarkers = [];
    
    for (var i = 0; i < paths.length; ++i) 
    {
        if (i == 0)
        {
            MapAddDirecationMarkerEnds(paths[i].lat(), paths[i].lng(), 'image/flags/Map_Flag_green.png', true);
        }
        else if (i == (paths.length-1))
        {
            MapAddDirecationMarkerEnds(paths[i].lat(), paths[i].lng(), 'image/flags/Map_Flag_red.png', false);
        }
    
        MapAddDirecationCornerFast(paths[i].lat(), paths[i].lng(), fastMarkers);
    }
    overlays.push(new com.redfin.FastMarkerOverlay(map, fastMarkers));
}

function addDirectionPoints(enc_points, enc_levels)
{

    for (var i = 0; i < enc_points.length; ++i) 
    {
        createPoint(enc_points[i][0], enc_points[i][1], enc_levels[i]);
    }

}   

//*********************************************************************\
//* New direction api                                                 *
//*********************************************************************/



function MapGetDirection(nativeParam)
{
    MapDirectionClear(null);

    if (selectCircle != null)
    {
         selectCircle.setVisible(false);
    }

    var encoded_points = nativeParam.Direction.Points;
    var encoded_levels = nativeParam.Direction.Levels;

    encoded_points = encoded_points.replace(/\\\\/g, "\\");
    encoded_points  = encoded_points.replace( /&bksp;/g, '\\' );
    
    var enc_points = decodeLine(encoded_points);
    
    if (enc_points == null || encoded_levels == null)
        return;
        
    decodeLevels(encoded_levels);

    setNativeResult(nativeParam, true);

    if (enc_points.length==0 || enc_levels.length==0) 
    {
        return;
    }

    if (enc_points.length != enc_levels.length) 
    {
    }


    points = [];
    paths = [];
                
    addDirectionPoints(enc_points, enc_levels);         
    
    directionLine = new google.maps.Polyline({
                            clickable: false,
                            geodesic :false,
                            map: map,
                            path: paths,       
                            strokeColor: '#DD00FF',       
                            strokeOpacity: 0.7,       
                            strokeWeight: 5,
                            zIndex: 7
                            });


    var polybounds = new google.maps.LatLngBounds();

    for(var j=0; j<paths.length; j++)
    { 
        if (paths[j])
        {
            polybounds.extend(paths[j]);
        }
    }    
    map.fitBounds(polybounds);
    var fullscreenZoom = map.getZoom();

    if (fullscreenZoom > 2)
    {
    	map.setZoom(fullscreenZoom-1)
    }

    setTimeout("addDirectionMarkers();", 2000);

//  map.panTo(polybounds.getCenter());
//  setTimeout("map.fitBounds(polybounds)", 1000);
//  setTimeout("addDirectionMarkers()", 1000);
    delete polybounds;
    return;
}


function MapDirectionShowStep(nativeParam)
{
    var intStep = parseInt(nativeParam.Direction.stepindex);
    if (intStep == -1)
    {
        var polybounds = new google.maps.LatLngBounds();

        for(var j=0; j<paths.length; j++)
        { 
            if (paths[j])
            {
                polybounds.extend(paths[j]);
            }
        }    
        
        map.fitBounds(polybounds);
        
        moveToStep = 1;
        
        return;
    }

    if (intStep == 0 ) 
    {
    moveToStep = 0;    
        map.setCenter(paths[intStep])
        map.setZoom(19);
//        if (selectCircle)
//        {
//            selectCircle.setPosition(paths[intStep]);
//            selectCircle.setVisible(true);
//        }
        return;
    }

    if (intStep == 1 ) 
    {
//        map.setCenter(paths[intStep-1])
//        map.setZoom(19);
        if (selectCircle)
        {
            selectCircle.setPosition(paths[intStep-1]);
            selectCircle.setVisible(true);
        }
        return;
    }
    
    if (intStep > 0 && intStep <= paths.length)
    {
        map.panTo(paths[intStep-1])
        if (moveToStep == 1)
        {
            map.setZoom(19);
            moveToStep = 0;    
        }

        if (selectCircle)
        {
            selectCircle.setPosition(paths[intStep-1]);
            selectCircle.setVisible(true);
        }
        return;
    }
    
    if (enc_levels.length > intStep)
    {
//        map.setZoom(enc_levels[intStep]);
    }
    
    
}


function MapAddDirecationMarkerEnds(initLat, initLang, imageurl, startflag)
{
    
    var point2 = new google.maps.LatLng(initLat, initLang);

    var dragable = false;
    
    var visibleparam = true;
    
    directionStep = directionStep + 1;
                                    
    
    if (startflag == true)
    {
        if (directionStmarker)
        {
            directionStmarker.setPosition(point2);
            directionStmarker.setVisible(true);
            attachDirectionMarkerId(directionStmarker, directionStep);
            return;
        }
        
        var mimage = new google.maps.MarkerImage(imageurl,
                                    null,
                                    null,
                                    null,
                                    null); 
                                    
        directionStmarker = new google.maps.Marker({
        position: point2,
        map: map,
        icon: mimage,
        clickable:true,
        cursor:' ',
        draggable:false,
        flat:false,
        title:'',
        shadow:IMG_FLAG_SHADOW
        
        });

        attachDirectionMarkerId(directionStmarker, directionStep);
        
        delete mimage;

    }
    else
    {
        if (directionEndmarker)
        {
            directionEndmarker.setPosition(point2);
            directionEndmarker.setVisible(true);
            attachDirectionMarkerId(directionEndmarker, directionStep);
            return;
        }

        var mimage = new google.maps.MarkerImage(imageurl,
                                    null,
                                    null,
                                    null,
                                    null); 
        
        directionEndmarker = new google.maps.Marker({
            position: point2,
            map: map,
            icon: mimage,
            clickable:true,
            cursor:' ',
            draggable:false,
            flat:false,
            title:'',
            shadow:IMG_FLAG_SHADOW
            });

        attachDirectionMarkerId(directionEndmarker, directionStep);
        
        delete mimage;
    }
    
    delete point2;
}

function MapDirectionClear(nativeParam)
{
    moveToStep = 1;    
    prevDirStep = -1;
    startDirStep = -1;
    endDirStep = -1;
    clearDestination = -1;
    directionStep = -1;
    
    if (overlays)
    {
        var i = overlays.length;
        while (i--) 
        {
          var overlay = overlays[i];
          if (overlay) overlay.setMap(null);
          delete overlays[i];
        }    
    }
    
    if (directionLine)
    {
        directionLine.setMap(null);
    }
    
    if (directionEndmarker != null)
    {
        directionEndmarker.setVisible(false);
    }
    
    if (directionStmarker != null)
    {
        directionStmarker.setVisible(false);
    }
    
    overlays = [];
    paths = [];
    points = [];
    enc_levels = [];
    
    if (nativeParam)
    {
        nativeParam.Error = 0;
    }
    
}


//*********************************************************************\
//* old direction api                                                 *
//*********************************************************************/


function MapGetDirectionJS(nativeParam)
{
   var start = nativeParam.Direction.from;
   var end = nativeParam.Direction.to;
   var startLat = parseFloat(nativeParam.Direction.FromLat);
   var startLng = parseFloat(nativeParam.Direction.FromLng);
   var endLat = parseFloat(nativeParam.Direction.ToLat);
   var endLan = parseFloat(nativeParam.Direction.ToLng);

    
   var travelmode = parseInt(nativeParam.Direction.mode);
   var tarvelModeParam;
    
    if (travelmode == 1)
    {
    tarvelModeParam = google.maps.DirectionsTravelMode.DRIVING;
    }
    else
    {
    tarvelModeParam = google.maps.DirectionsTravelMode.WALKING;
//  tarvelModeParam = google.maps.DirectionsTravelMode.DRIVING;
    }
   var latLng = false;
   var startLatLan;
   var endLatLan;

   if (startLat != -200.0 && startLng != -200.0 && endLat != -200.0 && endLan != -200.0)    
   {
       startLatLan = new google.maps.LatLng(startLat, startLng);
       endLatLan = new google.maps.LatLng(endLat, endLan);
       latLng = true;
   }

    var argStart;
    var argEnd;
    
    if (latLng == false)
    {
    argStart = start;
    argEnd = end;
    }
    else
    {
    argStart = startLatLan;
    argEnd = endLatLan;
    }
    var request = 
    {
        origin:argStart, 
        destination:argEnd,
        region:'jp',
        travelMode: tarvelModeParam
    };
    
    directionsService.route(request, function(response, status) 
    {
      if (status == google.maps.DirectionsStatus.OK) 
      {
        directionResponse = response;
        directionsDisplay.setMap(map);
        if (response.routes[0])
        {
        
    
    for( var i = 0; i < response.routes[0].legs[0].steps.length; i++ )
         {
            MapAddDirecationCorner(response.routes[0].legs[0].steps[i].start_location.lat(),
                                response.routes[0].legs[0].steps[i].start_location.lng(),
                                '(TBD)' + response.routes[0].legs[0].steps[i].instructions.substring(0, 10) + '...');

         }
         
        gPopupFixBounds = true;

        MapAddDirecationEndMarker(response.routes[0].legs[0].end_location.lat(),
                                response.routes[0].legs[0].end_location.lng(),
                                response.routes[0].legs[0].end_address);
         
        gPopupFixBounds = true;
            MapAddDirecationStartMarker(response.routes[0].legs[0].start_location.lat(),
                                        response.routes[0].legs[0].start_location.lng(),
                                        response.routes[0].legs[0].start_address);
         
        }
        directionsDisplay.setDirections(response);
      }
      else
      {
//      alert(status);
      }
    });
}



function MapDirectionShowStepJS(nativeParam)
{

    var intStep = parseInt(nativeParam.Direction.stepindex);
    if (!directionResponse)
        return;
        
    if (intStep == -1)
    {
    
        map.setCenter(directionResponse.routes[0].bounds.getCenter());
        map.fitBounds(directionResponse.routes[0].bounds); 
        return;
    }
    

    if (intStep >= 0 &&  intStep < directionResponse.routes[0].legs[0].steps.length)
    {
        if (intStep == 0 || intStep == 1 ) //TODO: fix it for only 0
        {
            map.setZoom(19);
        }
        
        map.panTo(directionResponse.routes[0].legs[0].steps[intStep].start_location);
    }
    else if (intStep == directionResponse.routes[0].legs[0].steps.length+1)
    {
        map.panTo(directionResponse.routes[0].legs[0].end_location);
        return;
    
    }
    else
    {
        //step range out error
        return;
    }

    if (direction_marker[intStep].popup!= null)
    {
        direction_marker[intStep].popup.open(map, direction_marker[intStep].marker);
        if (prevDirStep != -1 && direction_marker[prevDirStep])
            direction_marker[prevDirStep].popup.close();
    }
    
    prevDirStep = intStep;

    
    stepCounter = intStep;
    if (clearDestination == -1)
    {
        direction_marker[startDirStep].popup.close();   
        direction_marker[endDirStep].popup.close(); 
        clearDestination = 0;
    }
}

function MapDirectionClearJS()
{
    directionsDisplay.setMap(null);
    prevDirStep = -1;
    startDirStep = -1;
    endDirStep = -1;
    clearDestination = -1;
   for(var i=0; i<gdmarkersList.length; i++)
   { 
    if (gdmarkersList[i])
            gdmarkersList[i].setMap(null); 
   }
   
   for(var i=0; i<gdpopupList.length; i++)
   { 
        
    if (gdpopupList[i])
            gdpopupList[i].close();
    } 
    
    gdmarkersList = new Array(); 
    gdpopupList = new Array(); 
  nativeParam.Error = 0;
    
}

function MapClearSearchMarker()
{
//   for(var i=0; i<gmarkersList.length; i++)
//   { 
//    if (gmarkersList[i])
//            gmarkersList[i].setMap(null); 
//   }
   
   for(var i=0; i<GlobalMarkerList.length; i++)
   { 
    if (GlobalMarkerList[i] && GlobalMarkerList[i] )
    {
    	    if (GlobalMarkerList[i].IconId ==  MapNaviSearchResultIcon)
	            GlobalMarkerList[i].Marker.setMap(null); 
    }	
   }
   
   for(var i=0; i<gpopupList.length; i++)
   { 
        
    if (gpopupList[i])
            gpopupList[i].close();
    } 
    
//    gmarkersList = new Array(); 
//    gpopupList = new Array(); 
    latlngbounds = new google.maps.LatLngBounds();



    if (selectCircle != null)
    {
        selectCircle.setVisible(false);
    }

}

function MapClearAllMarker(nativeParam)
{
//   for(var i=0; i<gmarkersList.length; i++)
//   { 
//    if (gmarkersList[i])
//            gmarkersList[i].setMap(null); 
//   }
   
   for(var i=0; i<GlobalMarkerList.length; i++)
   { 
    if (GlobalMarkerList[i] && GlobalMarkerList[i] )
    {
    	    if (GlobalMarkerList[i].IconId ==  MapNaviBookMarkIcon)
    	    		{
	            		GlobalMarkerList[i].Marker.setMap(null); 
    			}
    }	
   }
 
   for(var i=0; i<gpopupList.length; i++)
   { 
        
    if (gpopupList[i])
            gpopupList[i].close();
    } 
    
//    gmarkersList = new Array(); 
//    gpopupList = new Array(); 
    latlngbounds = new google.maps.LatLngBounds();
      nativeParam.Error = 0;
    if (selectCircle != null)
    {
        selectCircle.setVisible(false);
    }

}

function MapFixBounds()
{

   for(var i=0; i<gmarkersList.length; i++)
   { 
    if (gmarkersList[i])
    {
        latlngbounds.extend(gmarkersList[i].getPosition());
    }
        
    } 
    
    if (latlngbounds.isEmpty()) return;
    
    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds); 
}



function MapShowTrafficOverlay()
{
  trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);

}

function MapClearTrafficOverlay()
{
  if (trafficLayer)
  {
    trafficLayer.setMap(null);
  }
    
}

function MapCheckTrafficOverlay(nativeParam)
{
   var latlng2 = map.getCenter();
   if (latlng2 == null)
   {
	gUpdateSerialize = true;
	nativeParam.Error = 1;
	setNativeResult(nativeParam, true);             
	return;
   }
   var lat1 = latlng2.lat().toFixed(0);
   var lng1 = latlng2.lng().toFixed(0);
   var latlng = new google.maps.LatLng(lat1, lng1);   
   var geocoder = new google.maps.Geocoder();
   var lang = "en";

   geocoder.geocode({'latLng': latlng,  'language':lang}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) 
        {
            if (results[1].address_components[results[1].address_components.length-1])
        {
                var countryName = results[1].address_components[results[1].address_components.length-1].short_name;
            cppContext.SetTrafficCountry(countryName);
                nativeParam.Error = 0;
                gUpdateSerialize = true;
            setNativeResult(nativeParam, true);             
                
        }
        } 
        else 
        {
                gUpdateSerialize = true;
                nativeParam.Error = 1;
            setNativeResult(nativeParam, true);             
                
        }
      } else 
      {
                gUpdateSerialize = true;
                nativeParam.Error = 1;
            setNativeResult(nativeParam, true);             
                
      }
    });


}

function MapShowStreetView()
{
//    var fenway = new google.maps.LatLng(42.345573,-71.098326);

//    var panoramaOptions = 
//    {
//      position: fenway,
//      pov: {
//        heading: 34,
//        pitch: 10,
//        zoom: 1
       
//      }
//   };
    
    
//    var panorama = new  google.maps.StreetViewPanorama(document.getElementById("mapview"),panoramaOptions);
//    map.setStreetView(panorama);
}

  function MapMarkerId()
  {
    this.counter = 0;
  }

  function MapPanLeft()
  {
      map.panBy(10, 0);
  }
  function MapPanRight()
  {
      map.panBy(0, 10);
  }
  function MapPanUp()
  {
      map.panBy(-10, 0);
  }
  function MapPanDown()
  {
      map.panBy(0, -10);
  }


MapMarkerId.prototype.clicked = function(overlay, latlng, overlaylatlng)
{

}

function MapCanvasClick(event)
{
}

function MapClickHandler()
{
}

MapClickHandler.prototype.clicked = function()
{

}

function MapGetCenter(nativeParam)
{
    var latlang2 = map.getCenter();

    nativeParam.Error = 0;
    cppContext.SetCenterLat(latlang2.lat());
    cppContext.SetCenterLng(latlang2.lng());
}

function MapGetZoom(nativeParam)
{
    var mapzoom = map.getZoom();

    nativeParam.Error = 0;
    cppContext.SetZoom(mapzoom);
}


//----------------Navigation APIs---------

function MapMoveTo(nativeParam)
{
    var lat = parseFloat(nativeParam.MapCenter.lat);
    var lon = parseFloat(nativeParam.MapCenter.lan);
    var point = new google.maps.LatLng(lat, lon);
    var latlang2 = map.getCenter();

    nativeParam.Error = 0;
    var serializeRet = false;
    
    if (latlang2.equals(point))
    {
        setNativeResult(nativeParam, true);
    }
    else
    {
        if (map.getBounds().contains(point))
              serializeRet = true;

        map.panTo(point);

	   for(var i=0; i<gmarkersList.length; i++)
	   { 
	    if (gmarkersList[i] && gmarkersList[i].getPosition().equals(point) )
	    {
		if (selectCircle)
		{
		    selectCircle.setPosition(gmarkersList[i].getPosition());
		    selectCircle.setVisible(true);
		}
	    }
	   }

    }
    if (serializeRet)
    {
        setNativeResult(nativeParam, true);
    }
    else
    {
        setNativeResult(nativeParam, false);
    }
}


function MapSetCenter(nativeParam)
{
    var lat = parseFloat(nativeParam.MapCenter.lat);
    var lon = parseFloat(nativeParam.MapCenter.lan);
    var point = new google.maps.LatLng(lat, lon);
    map.setCenter(point);
    nativeParam.Error = 0;
}

function MapZoomOut(nativeParam)
{
    var paramZoomVal = parseInt(nativeParam.MapZoomLevel.level);
    map.setZoom(paramZoomVal);
    nativeParam.Error = 0;
    cppContext.SetEventType(15);
    var currentZoomlevel = map.getZoom();
    if (currentZoomlevel != gcurrentZoomlevel)
    {
        cppContext.SetZoom(currentZoomlevel);
        gcurrentZoomlevel = currentZoomlevel;

    }
    else
    {
        cppContext.SetZoom(-1);
    }
    cppContext.SetPoCId(18);
    cppContext.ForceSerialize();
    cppContext.SetEventType(0);
}

function MapZoomIn(nativeParam)
{
    var paramZoomVal = parseInt(nativeParam.MapZoomLevel.level);
    map.setZoom(paramZoomVal);
    nativeParam.Error = 0;

    cppContext.SetEventType(15);
    var currentZoomlevel = map.getZoom();
    if (currentZoomlevel != gcurrentZoomlevel)
    {
        cppContext.SetZoom(currentZoomlevel);
        gcurrentZoomlevel = currentZoomlevel;

    }
    else
    {
        cppContext.SetZoom(-1);
    }
    cppContext.SetPoCId(19);
    cppContext.ForceSerialize();
    cppContext.SetEventType(0);
    
}



function MapSetType(nativeParam)
{
    switch (parseInt(nativeParam.MapType.type))
    {
    case 0: map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
    case 1: map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
    case 2: map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
    default: ;
    }
    nativeParam.Error = 0;
}

//----------------------------------------




//------------ new code

function CppContextHelper() 
{
    var  functionId     =-1;
        var  eventType       =-1;
    var  retValue       =-1;
    var  loadFinished   =-1;

    var  screenX   =0;
    var  screenY   =0;
    var  markerId       =-1;

    var  zoom            =-1;
    var  centerLat       =200;
    var  centerLng       =200;

    var  boundsLTLat       =200;
    var  boundsLTLng       =200;
    var  boundsRBLat       =200;
    var  boundsRBLng       =200;

    var  trafficCountry     ="ja";
    var  stepIndex          =-1;
        var  atomicId       =-1;


    // --- //   
    this.setFunctionId = function (id) 
    {
        functionId = id;
    }
    
    this.getFunctionId = function () 
    {
        return functionId;
    }

    // --- //   
    this.setEventType = function (id) 
    {
        eventType = id;
    }
    
    this.getEventType = function () 
    {
        return eventType;
    }

    // --- //   
    this.setAtomicId = function (id) 
    {
        atomicId = id;
    }
    
    this.getAtomicId = function () 
    {
        return atomicId;
    }

    // --- //   
    this.setRetValue = function (id) 
    {
        retValue = id;
    }
    
    this.getRetValue = function () 
    {
        return retValue;
    }

    // --- //   
    this.setLoadFinished = function (id) 
    {
        loadFinished = id;
    }
    
    this.getLoadFinished = function () 
    {
        return loadFinished;
    }

    // --- //   
    this.setScreenX = function (id) 
    {
        screenX = id;
    }
    
    this.getScreenX = function () 
    {
        return screenX;
    }

    // --- //   
    this.setScreenY = function (id) 
    {
        screenY = id;
    }
    
    this.getScreenY = function () 
    {
        return screenY;
    }

    // --- //   
    this.setMarkerId = function (id) 
    {
        markerId = id;
    }
    
    this.getMarkerId = function () 
    {
        return markerId;
    }

    // --- //   
    this.setZoom = function (id) 
    {
        zoom = id;
    }
    
    this.getZoom = function () 
    {
        return zoom;
    }

    // --- //   
    this.setCenterLat = function (id) 
    {
        centerLat = id;
    }
    
    this.getCenterLat = function () 
    {
        return centerLat;
    }

    // --- //   
    this.setCenterLng = function (id) 
    {
        centerLng = id;
    }
    
    this.getCenterLng = function () 
    {
        return centerLng;
    }

    // --- //   
    this.setBoundsLTLat = function (id) 
    {
        boundsLTLat = id;
    }
    
    this.getBoundsLTLat = function () 
    {
        return boundsLTLat;
    }

    // --- //   
    this.setBoundsLTLng = function (id) 
    {
        boundsLTLng = id;
    }
    
    this.getBoundsLTLng  = function () 
    {
        return boundsLTLng;
    }

    // --- //   
    this.setBoundsRBLat = function (id) 
    {
        boundsRBLat = id;
    }
    
    this.getBoundsRBLat = function () 
    {
        return boundsRBLat;
    }

    // --- //   
    this.setBoundsRBLng = function (id) 
    {
        boundsRBLng = id;
    }
    
    this.getBoundsRBLng = function () 
    {
        return boundsRBLng;
    }

    // --- //   
    this.setTrafficCountry = function (id) 
    {
        trafficCountry = id;
    }
    
    this.getTrafficCountry = function () 
    {
        return trafficCountry;
    }

    // --- //   
    this.setStepIndex = function (id) 
    {
        stepIndex = id;
    }
    
    this.getStepIndex = function () 
    {
        return stepIndex;
    }
    // --- //   
    this.setPoCId = function (id) 
    {
        poc = id;
    }
    
    this.getPoCId = function () 
    {
        return poc;
    }
}


CppContextHelper.prototype.SetMarkerId = function(smarker)
{
    this.setMarkerId(smarker);
}


CppContextHelper.prototype.SetMarker = function(smarker)
{
   for(var i=0; i<gmarkersList.length; i++)
   { 
    if (gmarkersList[i] == smarker)
    {
        this.setMarkerId(gmarkersIdList[i]);
    }
   }
}

CppContextHelper.prototype.SetFunctionId = function(param)
{
    this.setFunctionId(param);
}

CppContextHelper.prototype.SetEventType = function(param)
{
    this.setEventType(param);
}


CppContextHelper.prototype.SetAtomicId = function(param)
{
    this.setAtomicId(param);
}

CppContextHelper.prototype.SetRetValue = function(param)
{
    this.setRetValue(param);
}

CppContextHelper.prototype.SetLoadFinished = function(param)
{
    this.setLoadFinished(param);
}

CppContextHelper.prototype.SetScreenX = function(param)
{
    this.setScreenX(param);
}

CppContextHelper.prototype.SetScreenY = function(param)
{
    this.setScreenY(param);
}

CppContextHelper.prototype.SetZoom = function(param)
{
    this.setZoom(param);
}

CppContextHelper.prototype.SetCenterLat = function(param)
{
    this.setCenterLat(param);
}

CppContextHelper.prototype.SetCenterLng = function(param)
{
    this.setCenterLng(param);
}

CppContextHelper.prototype.SetBoundsLTLat = function(param)
{
    this.setBoundsLTLat(param);
}

CppContextHelper.prototype.SetBoundsLTLng = function(param)
{
    this.setBoundsLTLng(param);
}

CppContextHelper.prototype.SetBoundsRBLat = function(param)
{
    this.setBoundsRBLat(param);
}

CppContextHelper.prototype.SetBoundsRBLng = function(param)
{
    this.setBoundsRBLng(param);
}

CppContextHelper.prototype.SetTrafficCountry = function(param)
{
    this.setTrafficCountry(param);
}

CppContextHelper.prototype.SetStepIndex = function(param)
{
    this.setStepIndex(param);
}

CppContextHelper.prototype.SetPoCId = function(param)
{
    this.setPoCId (param);
}

CppContextHelper.prototype.Serialize = function()
{
    if (gUpdateSerialize)
    {
    window.confirm(this.getFunctionId() + "##" +
        this.getEventType() + "##" +
        this.getRetValue() + "##" +
        this.getLoadFinished() + "##" +
        this.getScreenX() + "##" +
        this.getScreenY() + "##" +
        this.getMarkerId() + "##" +
        this.getZoom() + "##" +
        this.getCenterLat() + "##" +
        this.getCenterLng() + "##" +
        this.getBoundsLTLat() + "##" +
        this.getBoundsLTLng() + "##" +
        this.getBoundsRBLat() + "##" +
        this.getBoundsRBLng() + "##" +
        this.getTrafficCountry() + "##" +
        this.getStepIndex() + "##" +
        this.getAtomicId() + "##" +
        this.getPoCId() + "##" );
    }
}

CppContextHelper.prototype.ForceSerialize = function()
{
    window.confirm(this.getFunctionId() + "##" +
        this.getEventType() + "##" +
        this.getRetValue() + "##" +
        this.getLoadFinished() + "##" +
        this.getScreenX() + "##" +
        this.getScreenY() + "##" +
        this.getMarkerId() + "##" +
        this.getZoom() + "##" +
        this.getCenterLat() + "##" +
        this.getCenterLng() + "##" +
        this.getBoundsLTLat() + "##" +
        this.getBoundsLTLng() + "##" +
        this.getBoundsRBLat() + "##" +
        this.getBoundsRBLng() + "##" +
        this.getTrafficCountry() + "##" +
	this.getStepIndex() + "##" +
        this.getAtomicId() + "##" +
        this.getPoCId() + "##" );
}


// ----------- new code


function removeStaticMap() 
{
    return;
  setTimeout(pushStaticMap,500);
  
  function pushStaticMap() 
  {
    var d = document.getElementById('mapcontainer');
    if (image)
    {
        var image = document.getElementById("gmserverimage");
        image.style.zIndex = 0;
    if (d)
    {
        d.removeChild(image);
    }
    }
    
    if (d)
    {
        d.style.display = 'none';
    }
  }
}


//projection
//converter from google.maps.Point object to google.maps.LatLng object
function fromPixelToLatLng(point)
{ 
	if( point==null || !(point instanceof google.maps.Point))
	{  
		return null; 
	} 
	return projectionHelper.getProjection().fromDivPixelToLatLng(point);

}

//converter from google.maps.LatLng object to google.maps.Point object
function fromLatLngToPixel(latLng)
{ 
	if(latLng==null || !(latLng instanceof google.maps.LatLng))
	{  
		return null; 
	}
	
	// スクロールを行うと
	// 正しい位置が取得できない問題があるため、
	// スクロール量を考慮する
	var canvas = document.getElementById('mapview');
	var center_canvas 	= new google.maps.Point(canvas.clientWidth / 2, canvas.clientHeight / 2);
	var center_map    	= projectionHelper.getProjection().fromLatLngToDivPixel(map.getCenter());
	var offset			= new google.maps.Point(center_map.x - center_canvas.x, center_map.y - center_canvas.y);
	var pos 			= projectionHelper.getProjection().fromLatLngToDivPixel(latLng);

	pos.x -= offset.x;
	pos.y -= offset.y;
	return pos;
}

function ProjectionHelper(overlayMap) 
{  
	google.maps.OverlayView.call(this);  
	this.setMap(overlayMap);
}

ProjectionHelper.prototype = new google.maps.OverlayView();

ProjectionHelper.prototype.draw = function () 
{ 
}


// --------------debugcode ---------------

function MapMoveToTest()
{
    var initLatitude2 = 35.680551;
    var initLongitude2 = 139.767208;
    var initZoom2 = 10;

    InitializeGoogleMap('mapview', initLatitude2,  initLongitude2, initZoom2, google.maps.MapTypeId.ROADMAP);
}

//
function InfoBox(opt_opts) {

  opt_opts = opt_opts || {};

  google.maps.OverlayView.apply(this, arguments);

  // Standard options (in common with google.maps.InfoWindow):
  //
  this.content_ = opt_opts.content || "";
  this.disableAutoPan_ = opt_opts.disableAutoPan || false;
  this.maxWidth_ = opt_opts.maxWidth || 0;
  this.pixelOffset_ = opt_opts.pixelOffset || new google.maps.Size(0, 0);
  this.position_ = opt_opts.position || new google.maps.LatLng(0, 0);
  this.zIndex_ = opt_opts.zIndex || null;

  // Additional options (unique to InfoBox):
  //
  this.boxClass_ = opt_opts.boxClass || "infoBox";
  this.boxStyle_ = opt_opts.boxStyle || {};
  this.closeBoxMargin_ = opt_opts.closeBoxMargin || "2px";
  this.closeBoxURL_ = opt_opts.closeBoxURL || "http://www.google.com/intl/en_us/mapfiles/close.gif";
  if (opt_opts.closeBoxURL === "") {
    this.closeBoxURL_ = "";
  }
  this.infoBoxClearance_ = opt_opts.infoBoxClearance || new google.maps.Size(1, 1);
  this.isHidden_ = opt_opts.isHidden || false;
  this.pane_ = opt_opts.pane || "floatPane";
  this.enableEventPropagation_ = opt_opts.enableEventPropagation || false;

  this.div_ = null;
  this.closeListener_ = null;
  this.eventListener1_ = null;
  this.eventListener2_ = null;
  this.eventListener3_ = null;
  this.contextListener_ = null;
  this.fixedWidthSet_ = null;
}

/* InfoBox extends OverlayView in the Google Maps API v3.
 */
InfoBox.prototype = new google.maps.OverlayView();

/**
 * Creates the DIV representing the InfoBox.
 * @private
 */
InfoBox.prototype.createInfoBoxDiv_ = function () {

  var bw;
  var me = this;

  // This handler prevents an event in the InfoBox from being passed on to the map.
  //
  var cancelHandler = function (e) {
    e.cancelBubble = true;

    if (e.stopPropagation) {

      e.stopPropagation();
    }
  };

  // This handler ignores the current event in the InfoBox and conditionally prevents
  // the event from being passed on to the map. It is used for the contextmenu event.
  //
  var ignoreHandler = function (e) {

    e.returnValue = false;

    if (e.preventDefault) {

      e.preventDefault();
    }

    if (!me.enableEventPropagation_) {

      cancelHandler(e);
    }
  };

  if (!this.div_) {

    this.div_ = document.createElement("div");

    this.setBoxStyle_();

    if (typeof this.content_.nodeType === "undefined") {
      this.div_.innerHTML = this.getCloseBoxImg_() + this.content_;
    } else {
      this.div_.innerHTML = this.getCloseBoxImg_();
      this.div_.appendChild(this.content_);
    }

    // Add the InfoBox DIV to the DOM
    this.getPanes()[this.pane_].appendChild(this.div_);

    this.addClickHandler_();

    if (this.div_.style.width) {

      this.fixedWidthSet_ = true;

    } else {

      if (this.maxWidth_ !== 0 && this.div_.offsetWidth > this.maxWidth_) {

        this.div_.style.width = this.maxWidth_;
        this.div_.style.overflow = "auto";
        this.fixedWidthSet_ = true;

      } else { // The following code is needed to overcome problems with MSIE

        bw = this.getBoxWidths_();

        this.div_.style.width = (this.div_.offsetWidth - bw.left - bw.right) + "px";
        this.fixedWidthSet_ = false;
      }
    }

    this.panBox_(this.disableAutoPan_);

    if (!this.enableEventPropagation_) {

      // Cancel event propagation.
      //
      this.eventListener1_ = google.maps.event.addDomListener(this.div_, "mousedown", cancelHandler);
      this.eventListener2_ = google.maps.event.addDomListener(this.div_, "click", cancelHandler);
      this.eventListener3_ = google.maps.event.addDomListener(this.div_, "dblclick", cancelHandler);
    }

    this.contextListener_ = google.maps.event.addDomListener(this.div_, "contextmenu", ignoreHandler);

    /**
     * This event is fired when the DIV containing the InfoBox's content is attached to the DOM.
     * @name InfoBox#domready
     * @event
     */
    google.maps.event.trigger(this, "domready");
  }
};

/**
 * Returns the HTML <IMG> tag for the close box.
 * @private
 */
InfoBox.prototype.getCloseBoxImg_ = function () {

  var img = "";

  if (this.closeBoxURL_ !== "") {

    img  = "<img";
    img += " src='" + this.closeBoxURL_ + "'";
    img += " align=right"; 
    img += " style='";
    img += " position: relative;"; 
    img += " margin: " + this.closeBoxMargin_ + ";";
    img += "'>";
  }

  return img;
};

/**
 * Adds the click handler to the InfoBox close box.
 * @private
 */
InfoBox.prototype.addClickHandler_ = function () {

  var closeBox;

  if (this.closeBoxURL_ !== "") {

    closeBox = this.div_.firstChild;
    this.closeListener_ = google.maps.event.addDomListener(closeBox, 'click', this.getCloseClickHandler_());

  } else {

    this.closeListener_ = null;
  }
};

/**
 * Returns the function to call when the user clicks the close box of an InfoBox.
 * @private
 */
InfoBox.prototype.getCloseClickHandler_ = function () {

  var me = this;

  return function (e) {

    // 1.0.3 fix: Always prevent propagation of a close box click to the map:
    e.cancelBubble = true;

    if (e.stopPropagation) {

      e.stopPropagation();
    }

    me.close();

    /**
     * This event is fired when the InfoBox's close box is clicked.
     * @name InfoBox#closeclick
     * @event
     */
    google.maps.event.trigger(me, "closeclick");
  };
};

/**
 * Pans the map so that the InfoBox appears entirely within the map's visible area.
 * @private
 */
InfoBox.prototype.panBox_ = function (disablePan) {

  if (!disablePan) {

    var map = this.getMap();
    var bounds = map.getBounds();

    // The degrees per pixel
    var mapDiv = map.getDiv();
    var mapWidth = mapDiv.offsetWidth;
    var mapHeight = mapDiv.offsetHeight;
    var boundsSpan = bounds.toSpan();
    var longSpan = boundsSpan.lng();
    var latSpan = boundsSpan.lat();
    var degPixelX = longSpan / mapWidth;
    var degPixelY = latSpan / mapHeight;

    // The bounds of the map
    var mapWestLng = bounds.getSouthWest().lng();
    var mapEastLng = bounds.getNorthEast().lng();
    var mapNorthLat = bounds.getNorthEast().lat();
    var mapSouthLat = bounds.getSouthWest().lat();

    // The bounds of the box
    var position = this.position_;
    var iwOffsetX = this.pixelOffset_.width;
    var iwOffsetY = this.pixelOffset_.height;
    var padX = this.infoBoxClearance_.width;
    var padY = this.infoBoxClearance_.height;
    var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
    var iwEastLng = position.lng() + (iwOffsetX + this.div_.offsetWidth + padX) * degPixelX;
    var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
    var iwSouthLat = position.lat() - (iwOffsetY + this.div_.offsetHeight + padY) * degPixelY;

    if (gPopupFixBounds)
    {
        var nlnp2 = new google.maps.LatLng(iwNorthLat, iwEastLng);  
        var nlnp4 = new google.maps.LatLng(iwSouthLat, iwWestLng);  

        var nlbbounds1 = new google.maps.LatLngBounds(nlnp4, nlnp2);
        if (directionResponse)
        {
        var nlbbounds2 = directionResponse.routes[0].bounds.union(nlbbounds1);
            map.setCenter(nlbbounds2.getCenter());
            map.fitBounds(nlbbounds2); 
        }
    gPopupFixBounds = false;
    }
    
    // Calculate center shift
    var shiftLng =
      (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
      (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
    var shiftLat =
      (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
      (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

    if (!(shiftLat === 0 && shiftLng === 0)) {

      // Move the map to the new shifted center.
      //
      var c = map.getCenter();
      map.setCenter(new google.maps.LatLng(c.lat() - shiftLat, c.lng() - shiftLng));
    }
  }
};

/**
 * Sets the style of the InfoBox by setting the style sheet and applying
 * other specific styles requested.
 * @private
 */
InfoBox.prototype.setBoxStyle_ = function () {

  var i, boxStyle;

  if (this.div_) {

    // Apply style values from the style sheet defined in the boxClass parameter:
    this.div_.className = this.boxClass_;

    // Clear existing inline style values:
    this.div_.style.cssText = "";

    // Apply style values defined in the boxStyle parameter:
    boxStyle = this.boxStyle_;
    for (i in boxStyle) {

      if (boxStyle.hasOwnProperty(i)) {

        this.div_.style[i] = boxStyle[i];
      }
    }

    // Fix up opacity style for benefit of MSIE:
    //
    if (typeof this.div_.style.opacity !== "undefined") {

      this.div_.style.filter = "alpha(opacity=" + (this.div_.style.opacity * 100) + ")";
    }

    // Apply required styles:
    //
    this.div_.style.position = "absolute";
    this.div_.style.visibility = 'hidden';
    if (this.zIndex_ !== null) {

      this.div_.style.zIndex = this.zIndex_;
    }
  }
};

/**
 * Get the widths of the borders of the InfoBox.
 * @private
 * @return {Object} widths object (top, bottom left, right)
 */
InfoBox.prototype.getBoxWidths_ = function () {

  var computedStyle;
  var bw = {top: 0, bottom: 0, left: 0, right: 0};
  var box = this.div_;

  if (document.defaultView && document.defaultView.getComputedStyle) {

    computedStyle = box.ownerDocument.defaultView.getComputedStyle(box, "");

    if (computedStyle) {

      // The computed styles are always in pixel units (good!)
      bw.top = parseInt(computedStyle.borderTopWidth, 10) || 0;
      bw.bottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
      bw.left = parseInt(computedStyle.borderLeftWidth, 10) || 0;
      bw.right = parseInt(computedStyle.borderRightWidth, 10) || 0;
    }

  } else if (document.documentElement.currentStyle) { // MSIE

    if (box.currentStyle) {

      // The current styles may not be in pixel units, but assume they are (bad!)
      bw.top = parseInt(box.currentStyle.borderTopWidth, 10) || 0;
      bw.bottom = parseInt(box.currentStyle.borderBottomWidth, 10) || 0;
      bw.left = parseInt(box.currentStyle.borderLeftWidth, 10) || 0;
      bw.right = parseInt(box.currentStyle.borderRightWidth, 10) || 0;
    }
  }

  return bw;
};

/**
 * Invoked when <tt>close</tt> is called. Do not call it directly.
 */
InfoBox.prototype.onRemove = function () {

  if (this.div_) {

    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

/**
 * Draws the InfoBox based on the current map projection and zoom level.
 */
InfoBox.prototype.draw = function () {

  this.createInfoBoxDiv_();

  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.position_);

  this.div_.style.left = (pixPosition.x + this.pixelOffset_.width) + "px";
  this.div_.style.top = (pixPosition.y + this.pixelOffset_.height) + "px";

  if (this.isHidden_) {

    this.div_.style.visibility = 'hidden';

  } else {

    this.div_.style.visibility = "visible";
  }
};

/**
 * Sets the options for the InfoBox. Note that changes to the <tt>maxWidth</tt>,
 *  <tt>closeBoxMargin</tt>, <tt>closeBoxURL</tt>, and <tt>enableEventPropagation</tt>
 *  properties have no affect until the current InfoBox is <tt>close</tt>d and a new one
 *  is <tt>open</tt>ed.
 * @param {InfoBoxOptions} opt_opts
 */
InfoBox.prototype.setOptions = function (opt_opts) {
  if (typeof opt_opts.boxClass !== "undefined") { // Must be first

    this.boxClass_ = opt_opts.boxClass;
    this.setBoxStyle_();
  }
  if (typeof opt_opts.boxStyle !== "undefined") { // Must be second

    this.boxStyle_ = opt_opts.boxStyle;
    this.setBoxStyle_();
  }
  if (typeof opt_opts.content !== "undefined") {

    this.setContent(opt_opts.content);
  }
  if (typeof opt_opts.disableAutoPan !== "undefined") {

    this.disableAutoPan_ = opt_opts.disableAutoPan;
  }
  if (typeof opt_opts.maxWidth !== "undefined") {

    this.maxWidth_ = opt_opts.maxWidth;
  }
  if (typeof opt_opts.pixelOffset !== "undefined") {

    this.pixelOffset_ = opt_opts.pixelOffset;
  }
  if (typeof opt_opts.position !== "undefined") {

    this.setPosition(opt_opts.position);
  }
  if (typeof opt_opts.zIndex !== "undefined") {

    this.setZIndex(opt_opts.zIndex);
  }
  if (typeof opt_opts.closeBoxMargin !== "undefined") {

    this.closeBoxMargin_ = opt_opts.closeBoxMargin;
  }
  if (typeof opt_opts.closeBoxURL !== "undefined") {

    this.closeBoxURL_ = opt_opts.closeBoxURL;
  }
  if (typeof opt_opts.infoBoxClearance !== "undefined") {

    this.infoBoxClearance_ = opt_opts.infoBoxClearance;
  }
  if (typeof opt_opts.isHidden !== "undefined") {

    this.isHidden_ = opt_opts.isHidden;
  }
  if (typeof opt_opts.enableEventPropagation !== "undefined") {

    this.enableEventPropagation_ = opt_opts.enableEventPropagation;
  }

  if (this.div_) {

    this.draw();
  }
};

/**
 * Sets the content of the InfoBox.
 *  The content can be plain text or an HTML DOM node.
 * @param {string|Node} content
 */
InfoBox.prototype.setContent = function (content) {
  this.content_ = content;

  if (this.div_) {

    if (this.closeListener_) {

      google.maps.event.removeListener(this.closeListener_);
      this.closeListener_ = null;
    }

    // Odd code required to make things work with MSIE.
    //
    if (!this.fixedWidthSet_) {

      this.div_.style.width = "";
    }

    if (typeof content.nodeType === "undefined") {
      this.div_.innerHTML = this.getCloseBoxImg_() + content;
    } else {
      this.div_.innerHTML = this.getCloseBoxImg_();
      this.div_.appendChild(content);
    }

    // Perverse code required to make things work with MSIE.
    // (Ensures the close box does, in fact, float to the right.)
    //
    if (!this.fixedWidthSet_) {

      this.div_.style.width = this.div_.offsetWidth + "px";
      this.div_.innerHTML = this.getCloseBoxImg_() + content;
    }

    this.addClickHandler_();
  }

  /**
   * This event is fired when the content of the InfoBox changes.
   * @name InfoBox#content_changed
   * @event
   */
  google.maps.event.trigger(this, "content_changed");
};

/**
 * Sets the geographic location of the InfoBox.
 * @param {LatLng} latlng
 */
InfoBox.prototype.setPosition = function (latlng) {

  this.position_ = latlng;

  if (this.div_) {

    this.draw();
  }

  /**
   * This event is fired when the position of the InfoBox changes.
   * @name InfoBox#position_changed
   * @event
   */
  google.maps.event.trigger(this, "position_changed");
};

/**
 * Sets the zIndex style for the InfoBox.
 * @param {number} index
 */
InfoBox.prototype.setZIndex = function (index) {

  this.zIndex_ = index;

  if (this.div_) {

    this.div_.style.zIndex = index;
  }

  /**
   * This event is fired when the zIndex of the InfoBox changes.
   * @name InfoBox#zindex_changed
   * @event
   */
  google.maps.event.trigger(this, "zindex_changed");
};

/**
 * Returns the content of the InfoBox.
 * @returns {string}
 */
InfoBox.prototype.getContent = function () {

  return this.content_;
};

/**
 * Returns the geographic location of the InfoBox.
 * @returns {LatLng}
 */
InfoBox.prototype.getPosition = function () {

  return this.position_;
};

/**
 * Returns the zIndex for the InfoBox.
 * @returns {number}
 */
InfoBox.prototype.getZIndex = function () {

  return this.zIndex_;
};

/**
 * Shows the InfoBox.
 */
InfoBox.prototype.show = function () {

  this.isHidden_ = false;
  this.div_.style.visibility = "visible";
};

/**
 * Hides the InfoBox.
 */
InfoBox.prototype.hide = function () {

  this.isHidden_ = true;
  this.div_.style.visibility = "hidden";
};

/**
 * Adds the InfoBox to the specified map. If <tt>anchor</tt>
 *  (usually a <tt>google.maps.Marker</tt>) is specified, the position
 *  of the InfoBox is set to the position of the <tt>anchor</tt>.
 * @param {Map} map
 * @param {MVCObject} [anchor]
 */
InfoBox.prototype.open = function (map, anchor) {

  if (anchor) {

    this.position_ = anchor.getPosition();
  }

  this.setMap(map);

  if (this.div_) {

    this.panBox_();
  }
};

/**
 * Removes the InfoBox from the map.
 */
InfoBox.prototype.close = function () {

  if (this.closeListener_) {

    google.maps.event.removeListener(this.closeListener_);
    this.closeListener_ = null;
  }

  if (this.eventListener1_) {

    google.maps.event.removeListener(this.eventListener1_);
    google.maps.event.removeListener(this.eventListener2_);
    google.maps.event.removeListener(this.eventListener3_);
    this.eventListener1_ = null;
    this.eventListener2_ = null;
    this.eventListener3_ = null;
  }

  if (this.contextListener_) {

    google.maps.event.removeListener(this.contextListener_);
    this.contextListener_ = null;
  }

  this.setMap(null);
};

