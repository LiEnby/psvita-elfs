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

//////////////////////////////////////////////////////// 
// 

const WORKAROUND_DISABLE_ANIMATION = false;

//////////////////////////////////////////////////////// 
// 
const MapView_ID = "mapview";
const Dummy_MapView_ID = "dummy_mapview";
const MapBGColor = 0x579500;

//////////////////////////////////////////////////////// 
// ZoomLevel

const MapZoomLevelMin = 2;
const MapZoomLevelMax = 21;
const MapZoomLevelFitBoundsMax = 17;
const Reconstruction_Zoom_Level = 3;

//////////////////////////////////////////////////////// 
// LatLng

const MapInitLatVal    = 0.0;
const MapInitLngVal    = 0.0;

///////////////////////////////////////////////////////
// MapType

const MapType_Normal 		= 0;
const MapType_Statellite	= 1;
const MapType_Hybrid		= 2;

///////////////////////////////////////////////////////
// MapLayerType
const MapLayerType_Traffic  = 0x00000001;
const MapLayerType_Weather  = 0x00000002;
const MapLayerType_Cloud    = 0x00000004;

///////////////////////////////////////////////////////
//MarkerType

const MarkerType_Bookmark_Shadow = -5;
const MarkerType_Shadow_Square	 = -4;
const MarkerType_Shadow			 = -3;
const MarkerType_SelectCircle	 = -2;
const MarkerType_CurrentPos		 = -1;
const MarkerType_Bookmark		 = 0;
const MarkerType_SearchResult	 = 1;
const MarkerType_UserFlag		 = 2;
const MarkerType_Dir_Step		 = 3;
const MarkerType_Dir_Start		 = 4;
const MarkerType_Dir_End		 = 5;

///////////////////////////////////////////////////////
// MarkerID

const CURRENT_POS_ICON_ID		= -3;

///////////////////////////////////////////////////////
// ZINDEX

const ZIndex_CurrentPos			= 310;
const ZIndex_SelectObject		= 301;
const ZIndex_SelectCircle		= 300;
const ZIndex_Marker             = 10;
const ZIndex_Direction_Step		= 2;
const ZIndex_Direction_Line	    = 1;

//////////////////////////////////////////////////
// Unit
const MapUnitMetric				= 0;	// メートル
const MapUnitMiles				= 1;	// マイル

//////////////////////////////////////////////////
// TravelMode

const MapTravelModeUnknown		= 0;
const MapTravelModeDriving		= 1;
const MapTravelModeWalking		= 2;

//////////////////////////////////////////////////
// 

var g_AsyncRequest = new Object();

//////////////////////////////////////////////////
// Diraction

var g_DirectionsService	= null;

var g_DirectionLine = null;
var g_RouteLineData = new Object();

const MAP_DIRECTION_STEPS_MAX	= 200;

//////////////////////////////////////////////////
// Places

var g_PlacesService		= null;

const HTML_LESS			= '>';
const HTML_GREATER		= '<';
const HTML_QUOT			= '"';
const HTML_ANCHOR_HREF	= '<a href=';

//////////////////////////////////////////////////
// Geocode

var g_Geocoder			= null;

//////////////////////////////////////////////////
// CppContextHelper
//////////////////////////////////////////////////
///////////////////////////////////////////////////////

//////////////////////////////////////////////////
// Marker 管理クラス

function ImageData(path, width, height, Imagewidth, Imageheight, anchor_x,anchor_y)
{
	this.Path = path;
	this.Width = width;
	this.Height = height;
	this.Anchor_X = anchor_x;
	this.Anchor_Y = anchor_y;
	this.ImageWidth  = Imagewidth;
	this.ImageHeight = Imageheight;
}

//アイコンのイメージのデータ

const FLAG_WIDTH				= 104;
const FLAG_HEIGHT				= 68;
const CUR_POS_DIAMETER			= 40;
const SELECT_CIRCLE_DIAMETER	= 74;
const DIR_STEP_DIAMETER			= 40;
const BOOKMARK_SIZE				= 80;

var g_ImageData = new Object();
g_ImageData[MarkerType_Bookmark]		= new ImageData('./image/bookmark/Map_Bookmark.png', BOOKMARK_SIZE, BOOKMARK_SIZE + CUR_POS_DIAMETER / 2, BOOKMARK_SIZE, BOOKMARK_SIZE, BOOKMARK_SIZE / 2, BOOKMARK_SIZE);
g_ImageData[MarkerType_SearchResult]	= new ImageData('./image/flags/Map_Flag_red.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_UserFlag]		= new ImageData('./image/flags/Map_Flag_Purple.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_CurrentPos]		= new ImageData('./image/flags/Dummy.png', CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER / 2, CUR_POS_DIAMETER / 2);
g_ImageData[MarkerType_SelectCircle]	= new ImageData('./image/flags/Select_Circle_Red_circle.png',SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER / 2, SELECT_CIRCLE_DIAMETER / 2);
g_ImageData[MarkerType_Dir_Step]		= new ImageData('./image/direction/Map_corn_circle.png', DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER / 2, DIR_STEP_DIAMETER / 2);
g_ImageData[MarkerType_Dir_Start]		= new ImageData('./image/flags/Map_Flag_start.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_Dir_End]			= new ImageData('./image/flags/Map_Flag_goal.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_Shadow]			= new ImageData('./image/flags/Map_Flag_shadow.png', null, null, null, null);
g_ImageData[MarkerType_Shadow_Square]	= new ImageData('./image/flags/Map_Flag_shadow_square.png', null, null, null, null);
g_ImageData[MarkerType_Bookmark_Shadow]	= new ImageData('./image/bookmark/Map_Bookmark_shadow.png', null, null, null, null);

//////////////////////////////////////////////////
// RegionMap

var g_RegionMap = new Object();
g_RegionMap["ja"]    = "JP";
g_RegionMap["en"]    = "US";
g_RegionMap["fr"]    = "FR";
g_RegionMap["es"]    = "ES";
g_RegionMap["de"]    = "DE";
g_RegionMap["it"]    = "IT";
g_RegionMap["nl"]    = "NL";
g_RegionMap["pt"]    = "PT";
g_RegionMap["ru"]    = "RU";
g_RegionMap["ko"]    = "KR";
g_RegionMap["zh-TW"] = "CN";
g_RegionMap["zh-CN"] = "CN";
g_RegionMap["fi"]    = "FI";
g_RegionMap["sv"]    = "SE";
g_RegionMap["da"]    = "DK";
g_RegionMap["no"]    = "NO";
g_RegionMap["pl"]    = "PL";
g_RegionMap["pt-BR"] = "BR";
g_RegionMap["en-GB"] = "UK";
g_RegionMap["tr"]    = "TR";

//////////////////////////////////////////////////
// LimitLat
// function CalcLimitLatLngで算出

var g_LatRange = new Object();
g_LatRange[2] = 66.5832136648409;
g_LatRange[3] = 79.1878327639311;
g_LatRange[4] = 82.68188363187267;
g_LatRange[5] = 83.98156278981405;
g_LatRange[6] = 84.54240521189978;
g_LatRange[7] = 84.80297050521685;
g_LatRange[8] = 84.92856292783912;
g_LatRange[9] = 84.99021931600038;
g_LatRange[10] = 85.0207665560649;
g_LatRange[11] = 85.03597043229402;
g_LatRange[12] = 85.0435549959533;
g_LatRange[13] = 85.04734294183476;
g_LatRange[14] = 85.0492358317453;
g_LatRange[15] = 85.05018200606258;
g_LatRange[16] = 85.05065502557665;
g_LatRange[17] = 85.0508915184244;
g_LatRange[18] = 85.0510097606212;
g_LatRange[19] = 85.05106888066284;
g_LatRange[20] = 85.0510984404195;
g_LatRange[21] = 85.05111322023176;

var g_NormalizeLatLng   = false;
//////////////////////////////////////////////////
// Variable

var	g_projectionHelper	= null;
var	g_map 				= null;
var	g_dummy_map			= null;
var	g_httpRequest		= null;
var	g_markermanager		= null;

var g_tilesLoaded		= 0;
var g_TileDirty 		= false;
var g_searched			= false;
var g_fitBounds			= false;
var g_refresh_workaround= false;
var g_AtomicId			= -1;
var g_height			= 0;
var g_width				= 0;

//////////////////////////////////////////////////
// layer

var g_trafficLayer      = null;
var g_weatherLayer      = null;
var g_cloudLayer        = null;

//////////////////////////////////////////////////
// weather

var g_temperatureUnits	= null;
var g_windSpeedUnits	= null;

//////////////////////////////////////////////////
// 単位　風速

const MapUnitWindSppedType_KilometersPerHour	= 0;
const MapUnitWindSppedType_MetersPerSecond		= 1;
const MapUnitWindSppedType_MilePerHour			= 2;

//////////////////////////////////////////////////
// 単位　気温

const MapUnitTemperatureType_Celsius	= 0;
const MapUnitTemperatureType_Fahrenheit = 1;

//////////////////////////////////////////////////
// v2.0 ブラウザ使用時のNearのプライバシーエリアの円追従用イベントに使用する変数

var g_UseMapMoveGesture			= false;

const FLICK_CHECK_TIMER_INTERVAL = 80;
const FLICK_CHECK_COUNT = 3;

const MapMoveGestureNone = 0;
const MapMoveGestureDrag = 1;
const MapMoveGestureFlick = 2;

var g_MapMoveGestureState = MapMoveGestureNone;

var g_GestureMapMoveBasePos = {x:0,y:0};
var g_GestureMapMovePos = {x:0,y:0};
var g_FlickCount = 0;
var g_FlickCheckTimerId = null;

//////////////////////////////////////////////////
// Initialize Status

const InitializeTileLoadingNone = 0;
const InitializeTileLoading = 1;
const InitializeTileLoadingWithOtherLoading = 2;

var g_InitializeTileLoadingStatus = InitializeTileLoadingNone;

//////////////////////////////////////////////////
// 

function CalcLimitLatLng()
{
	if(!g_map)
		return;
	
	g_refresh_workaround = true;
	const LAT_LIMIT 		= 85.051128; // タイルが存在する境界の緯度
	const LAT_LIMIT_MARGIN	= 0;
	
	for(var zoom = MapZoomLevelMin; zoom <= MapZoomLevelMax; zoom++)
	{
		g_map.setZoom(zoom);

		var latlng_limit  = new google.maps.LatLng(LAT_LIMIT, 0.0);
	    var pix_limit     = fromLatLngToPixel(latlng_limit);
		pix_limit.y 	  = pix_limit.y + g_height / 2 - LAT_LIMIT_MARGIN;

		var latlng_center = fromPixelToLatLng(pix_limit);
		var range = latlng_center.lat();
		printf("g_LatRange[" + zoom + "]  = " + range + ";");
	}
	g_refresh_workaround = false;
}

//////////////////////////////////////////////////
// ProjectionHelper
//////////////////////////////////////////////////
//projection
//converter from google.maps.Point object to google.maps.LatLng object

function fromPixelToLatLng(point)
{ 
	if( point==null || !(point instanceof google.maps.Point))
	{  
		return null; 
	} 

	if(!g_projectionHelper || g_projectionHelper.getProjection() == undefined)
	{
		return null; 
	}

	var latlng  = g_projectionHelper.getProjection().fromContainerPixelToLatLng(point);
	return latlng;
}

//converter from google.maps.LatLng object to google.maps.Point object
function fromLatLngToPixel(latLng)
{ 
	if(latLng==null || !(latLng instanceof google.maps.LatLng))
	{  
		return null; 
	}
	
	if(!g_projectionHelper || g_projectionHelper.getProjection() == undefined)
	{
		return null; 
	}

	var pos = g_projectionHelper.getProjection().fromLatLngToContainerPixel(latLng);
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

//////////////////////////////////////////////////
// 

// ズーム変更（ズームの中心をCSSの座標で指定）
function ChangeZoom_MoveCenter_CSS(level, zoom_center_old_pix, zoom_center_new_pix)
{
    if(zoom_center_old_pix.x == 0 && zoom_center_old_pix.y == 0 && zoom_center_new_pix.x == 0 && zoom_center_new_pix.y == 0)
    {
        // Only zoom
        internal_set_Zoom_Center(level);
    }
    else
    {
        // Zoom with Center(Css).
	    var zoom_center_latlng  = fromPixelToLatLng(zoom_center_old_pix);
		var oldZoom = g_map.getZoom();
	    g_map.setZoom(level);

	    var map_center_latlng   	 = g_map.getCenter();
	    var map_center_pix      	 = fromLatLngToPixel(map_center_latlng);
	    var zoom_center_temp_pix     = fromLatLngToPixel(zoom_center_latlng);
	    var move_offset_pix   		 = new google.maps.Point(zoom_center_new_pix.x - zoom_center_old_pix.x, zoom_center_new_pix.y - zoom_center_old_pix.y);
	    var zoom_center_offset_pix   = new google.maps.Point(zoom_center_temp_pix.x - zoom_center_old_pix.x, zoom_center_temp_pix.y - zoom_center_old_pix.y);
	    var center_new_pix      	 = new google.maps.Point(map_center_pix.x + zoom_center_offset_pix.x - move_offset_pix.x, map_center_pix.y + zoom_center_offset_pix.y- move_offset_pix.y);

	    var center_new_latlng   	 = fromPixelToLatLng(center_new_pix);
        center_new_latlng = NormalizeLatLng(center_new_latlng);
	    g_map.setCenter(center_new_latlng);
	    delete move_offset_pix;
	    delete zoom_center_offset_pix;
	    delete center_new_pix;
        internal_set_Zoom_Center(level, center_new_latlng, IsZoomAnimation(oldZoom, level));
	}
}

// ズーム変更（ズームの中心をCSSの座標で指定）

function ChangeZoom_Center_CSS(level, zoom_center_new_pix)
{
    var center_new_latlng  = fromPixelToLatLng(zoom_center_new_pix);

    center_new_latlng = NormalizeLatLng(center_new_latlng);
	internal_set_Zoom_Center(level, center_new_latlng);
}

//////////////////////////////////////////////////////// 

function googleMapAdapterTable(functionId, atomicId, nativeParam)
{
	var cppContext = new CppContextHelper();
	cppContext.eventType  = MapJSEventFunctionFinished;
	cppContext.retValue   = MAP_RESULT_SUCCESS;
	cppContext.functionId = functionId;
	cppContext.atomicId   = atomicId;
	
	switch (functionId)
	{
		case MAP_JSCALL_INITIALIZE_ID: 
		{
			Initialize(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_SETZOOM_ID:
		{
			MapSetZoom(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_SETZOOM_CENTER_ID:
		{
			MapSetZoomCenter(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_SETZOOM_OFFSET_ID:
		{
			MapSetZoomOffset(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_SET_MAP_TYPE_ID:
		{
			MapSetType(nativeParam);
			break;
		}
		case MAP_JSCALL_SETCENTER_ID:
		{
			MapSetCenter(nativeParam);
			break;
		}
		case MAP_JSCALL_SETCENTER_PIXEL_ID:
		{
			MapSetCenterWithPixel(nativeParam);
			break;
		}
		case MAP_JSCALL_MOVEPIXEL_ID:
		{
			MapMovePixel(nativeParam);
			break;
		}
		case MAP_JSCALL_MOVETO_MARKER_ID:
		{
			MapMoveToMarker(nativeParam);
			break;
		}
		case MAP_JSCALL_UPDATE_MARKER_ID:
		{
			UpdateMarker(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_UPDATE_CURRENT_POSITION_ICON_ID:
		{
			MapUpdateCurrentPositionIcon(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_ADD_MARKER_LIST_ID:
		{
			MapAddMarkerList(nativeParam);
			break;
		}
		case MAP_JSCALL_REMOVE_MARKERS_ID:
		{
			MapRemoveMarkers(nativeParam);
			break;
		}
		case MAP_JSCALL_REMOVE_ALL_MARKER_ID:
		{
			MapRemoveMarkerGroup(nativeParam);
			break;
		}
		case MAP_JSCALL_SHOW_ALL_MARKER_ID:
		{
			MapShowMarkerGroup(nativeParam);
			break;
		}
		case MAP_JSCALL_SELECT_MARKER_ID:
		{
			MapSelectMarker(nativeParam);
			break;
		}
		case MAP_JSCALL_SELECT_CURRENT_POSITION_ICON_ID:
		{
			MapSelectCurrentPositionIcon(nativeParam);
			break;
		}
		case MAP_JSCALL_UNSELECT_ID:
		{
			MapUnselect(nativeParam);
			break;
		}
		case MAP_JSCALL_SET_DIRECTION_DATA_ID:
		{
			MapSetDirectionData(nativeParam);
			break;
		}
		case MAP_JSCALL_ROUTE_REQUEST_ID:
		{
			// 要求毎にインスタンスを生成
			var Request = new MapRequestRoute(nativeParam, cppContext);
			Request.Execute();
			return; // Serializeさせない
		}
		case MAP_JSCALL_ROUTE_APPLY_ID:
		{
			MapApplyRoute(nativeParam, cppContext);
			break;
		}
		case MAP_JSCALL_CLEAR_DIRECTION_DATA_ID:
		{
			MapClearDirectionData();
			break;
		}
		case MAP_JSCALL_SHOW_URL_VIEW_ID:
		{
			break;
		}
		case MAP_JSCALL_MODIFY_LAYER_ID:
		{
		    MapModifyLayer(nativeParam);
			break;
		}
		case MAP_JSCALL_FIT_BOUNDS_ID:
		{
		    MapFitBounds(nativeParam);
		    break;
		}
		case MAP_JSCALL_REFRESH_TILES_ID:
		{
		    MapRefreshTiles(nativeParam);
		    break;
		}
		case MAP_JSCALL_MOVETO_CURRENT_POSITION_ICON_ID:
		{
			MapMoveToCurrentPositionIcon(nativeParam);
			break;
		}
		case MAP_JSCALL_GEOCODE_REQUEST_ID:
		case MAP_JSCALL_REVERSE_GEOCODE_REQUEST_ID:
		{
			// 要求毎にインスタンスを生成
			var Request = new MapRequestGeocode(nativeParam, cppContext);
			Request.Execute();
			return; // Serializeさせない
		}
		case MAP_JSCALL_PLACES_SEARCH_REQUEST_ID:
		{
			// 要求毎にインスタンスを生成
			var Request = new MapRequestPlacesSearch(nativeParam, cppContext);
			Request.Execute();
			return; // Serializeさせない
		}
		case MAP_JSCALL_PLACES_DETAILS_REQUEST_ID:
		{
			// 要求毎にインスタンスを生成
			var Request = new MapRequestPlacesDetails(nativeParam, cppContext);
			Request.Execute();
			return; // Serializeさせない
		}
		case MAP_JSCALL_UNIT_WIND_SPEED_TYPE_ID:
		{
			MapSetUnitWindSpeedType(nativeParam);
			break;
		}
		case MAP_JSCALL_UNIT_TEMPERATURE_TYPE_ID:
		{
			MapSetUnitTemperatureType(nativeParam);
			break;
		}
		case MAP_JSCALL_CANCEL_REQUEST_ID:
		{
			MapCancelRequest(nativeParam);
			break;
		}
		default:
		{
			printf("Invalid JS Request. ID[" + functionId + "]");
			return;
		}
	}

	cppContext.Serialize();
	delete cppContext;
}

function ConvertGoogleMapType(id)
{
	var mapType;
	switch(id)
	{
		case MapType_Normal:
	        mapType = google.maps.MapTypeId.ROADMAP;
			break;

		case MapType_Statellite:
	        mapType = google.maps.MapTypeId.SATELLITE;
			break;

		case MapType_Hybrid:
	        mapType = google.maps.MapTypeId.HYBRID;
			break;
	}
	
	return mapType;
}

function ConvertGoogleUnitWindSpeed(id)
{
	if(CheckMapVersion(3, 8) < 0)
		return null;

	var unit;

	switch(id)
	{
		case MapUnitWindSppedType_KilometersPerHour:
	        unit = google.maps.weather.WindSpeedUnit.KILOMETERS_PER_HOUR;
			break;

		case MapUnitWindSppedType_MetersPerSecond:
	        unit = google.maps.weather.WindSpeedUnit.METERS_PER_SECOND;
			break;

		case MapUnitWindSppedType_MilePerHour:
	        unit = google.maps.weather.WindSpeedUnit.MILES_PER_HOUR;
			break;
	}
	
	return unit;
}

function ConvertGoogleUnitTemperature(id)
{
	if(CheckMapVersion(3, 8) < 0)
		return null;
		
	var unit;

	switch(id)
	{
		case MapUnitTemperatureType_Celsius:
	        unit = google.maps.weather.TemperatureUnit.CELSIUS;
			break;

		case MapUnitTemperatureType_Fahrenheit:
	        unit = google.maps.weather.TemperatureUnit.FAHRENHEIT;
			break;
	}
	
	return unit;
}

///////////////////////////////////////////////////////

function SendMapMoveGesture(type)
{
	var cppContext = new CppContextHelper();
	cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
	cppContext.eventType  = type;
	cppContext.screenX = g_GestureMapMovePos.x;
	cppContext.screenY = g_GestureMapMovePos.y;
	cppContext.AddParam(0);
	cppContext.Serialize();
}

function FindMatrixElemChild(elem)
{
    var findelem = null;
	
    for(var child = elem.firstChild; child != null; child = child.nextSibling)
    {
		if(!child.style || !child.style.webkitTransform || child.style.webkitTransform.indexOf("matrix") == -1)
		{
	    	findelem = FindMatrixElemChild(child);
	    }
	    else
	    {
			findelem = child;
			break;
	    }
	    
	    if(findelem)
			break;
    }
    
    return findelem;
}

function GetMatrixElem()
{
	var elem = FindMatrixElemChild(document.getElementById("mapview"));
	return elem;
}

function GetMatrixPos()
{
	var pos = new Object();
	var matrix = GetMatrixElem();
	if(!matrix)
		return null;
	var tmpstr = matrix.style.webkitTransform;
	var idxb = tmpstr.indexOf("(");
	var idxe = tmpstr.indexOf(")");    			
	tmpstr = tmpstr.slice(idxb + 1,idxe);
	var strarray = tmpstr.split(",");
	pos.x = eval(strarray[4]);
	pos.y = eval(strarray[5]);
	return pos;
}

function FlickAbort()
{
	if(!g_FlickCheckTimerId)
		return;

	clearInterval(g_FlickCheckTimerId);
	g_FlickCheckTimerId = null;
	SendMapMoveGesture(MapJSEventFlickAbort);
	g_MapMoveGestureState = MapMoveGestureNone;
}

function FlickEnd()
{
	if(!g_FlickCheckTimerId)
		return;

	clearInterval(g_FlickCheckTimerId);
	g_FlickCheckTimerId = null;
	g_MapMoveGestureState = MapMoveGestureNone;

	SendMapMoveGesture(MapJSEventFlickEnd);
	if(g_GestureMapMoveBasePos.x != g_GestureMapMovePos.x || g_GestureMapMoveBasePos.y != g_GestureMapMovePos.y)
		NotifyCenterChanged();

	g_GestureMapMovePos = null;	
}

function UpdateFlickStatus()
{
	if(g_MapMoveGestureState != MapMoveGestureFlick)
	{
		return true;
	}

	var matrixpos = GetMatrixPos();
	if(!matrixpos)
	{
		printf("[ERROR]UpdateFlickStatus !GetMatrixPos().");
		return true;
	}
    
	var tmpMovePos = new Object();
	tmpMovePos.x = matrixpos.x - g_GestureMapMoveBasePos.x;
	tmpMovePos.y = matrixpos.y - g_GestureMapMoveBasePos.y;
    
	if(g_GestureMapMovePos.x != tmpMovePos.x || g_GestureMapMovePos.y != tmpMovePos.y)
	{
		g_FlickCount = 0;
		g_GestureMapMovePos = tmpMovePos;
		SendMapMoveGesture(MapJSEventFlickMove);
	}
	else
	{
		++g_FlickCount;
		if(g_FlickCount > FLICK_CHECK_COUNT)
		{
			g_FlickCount = 0;
			return true;
		}
	}
	
	return false;
}

function UpdateFlickStatusFunc()
{
	var end = UpdateFlickStatus();
	if(end)
	{
		FlickEnd();
	}
	else
	{
		g_FlickCheckTimerId = setTimeout("UpdateFlickStatusFunc()",FLICK_CHECK_TIMER_INTERVAL);
	}
}

function RegistMapEventV2Browser()
{
	const DBLCLICK_ACCEPT_TIME = 300;
	var waitsendclick = false;

	const LONG_PRESS_TIME = 300;
	var LongPressTimerValid = false;
	var LongPressPos = null;
	var LongPressExec = false;

	var FirstTouchPos = null;
	var DragFingerPos = null;
	var PinchPos = null;

	// アプリの動作上、クリックとダブルクリックイベントは排他制御する必要がある。
	google.maps.event.addListener(g_map, 'click', function(event) 
	{
		// 前回のクリックイベント送信待ちの場合はクリックイベントを処理しない
		if(waitsendclick)
		{
			return;
		}

		if(LongPressExec)
		{
			return;
		}

		var markerInfo = g_markermanager.GetHitMarker(event.pixel);

		waitsendclick = true;

		// クリックとダブルクリックイベントを排他制御するため
		// クリックイベントの処理を遅延させてダブルクリックイベントの受付時間を設ける。
		setTimeout(function(){
			if(!waitsendclick)
			{
				return;
			}
			
			waitsendclick = false;

			// marker click
			if(markerInfo && markerInfo.Obj)
			{
				g_markermanager.SelectMarker(markerInfo.Id);
				NotifySelectMarkerEvent(markerInfo.Id, markerInfo.Obj.getPosition());
			}
			else
			{
				var cppContext = new CppContextHelper();
 				cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
				cppContext.eventType  = MapJSEventMapClicked;
				cppContext.screenX = event.pixel.x;
				cppContext.screenY = event.pixel.y;
				cppContext.Serialize();
			}		
		},DBLCLICK_ACCEPT_TIME);
	});   

	google.maps.event.addListener(g_map, 'dblclick', function(event) 
	{
		// クリックイベントがC++側への送信待ちしている間に来た
		// ダブルクリックイベントのみ有効とする。
		if(waitsendclick)
		{
			// ダブルクリックイベントを処理する場合はC++側へ送信待ちしていた
			// クリックイベントはキャンセルする。
			waitsendclick = false;
			
			ChangeZoom_Center_CSS(g_map.getZoom() + 1,event.pixel);

			var cppContext = new CppContextHelper();
			cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
			cppContext.eventType  = MapJSEventMapDblClicked;
			cppContext.screenX = event.pixel.x;
			cppContext.screenY = event.pixel.y;
			cppContext.Serialize();
			
			g_TileDirty = true;
			return;
		}
	});

	var mapdoc = document.getElementById(MapView_ID);
	
	// idle イベントと対にさせるために DragBegin と PinchBegin は google.maps の dragstartイベントの後に送信する
	google.maps.event.addListener(g_map, 'dragstart', function() 
	{
		if(g_MapMoveGestureState == MapMoveGestureNone)
		{
			g_MapMoveGestureState = MapMoveGestureDrag;
			LongPressPos = null;
			g_TileDirty = true;
			var matrixpos = GetMatrixPos();
			if(!matrixpos)
			{
				matrixpos = new Object();
				matrixpos.x = 0;
				matrixpos.y = 0;
				printf("[ERROR]dragstart matrixpos is null");
			}

			g_GestureMapMovePos = new Object();
			g_GestureMapMovePos.x = matrixpos.x - g_GestureMapMoveBasePos.x;
			g_GestureMapMovePos.y = matrixpos.y - g_GestureMapMoveBasePos.y;
			SendMapMoveGesture(MapJSEventDragBegin);
		}
	});
	
	function TouchEventDataToTouchPosData(TouchData)
	{
		TouchPos = new Object();
		TouchPos.id = TouchData.identifier;
		TouchPos.x = TouchData.pageX;
		TouchPos.y = TouchData.pageY;
		return TouchPos;
	}

	mapdoc.addEventListener('touchstart', function(ev)
	{
//		printf("[SEND][TOUCH START] id=" + ev.changedTouches[0].identifier + " x=" + ev.changedTouches[0].pageX + " y=" + ev.changedTouches[0].pageY);						

		{
			var cppContext = new CppContextHelper();
			cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
			cppContext.eventType  = MapJSEventTouchStart;
			cppContext.screenX = ev.changedTouches[0].pageX;
			cppContext.screenY = ev.changedTouches[0].pageY;
			cppContext.AddParam(ev.changedTouches[0].identifier);
			cppContext.Serialize();
		}
		
		if(!FirstTouchPos && ev.touches.length == 1)
		{
			if(g_MapMoveGestureState == MapMoveGestureFlick)
				FlickAbort();

			FirstTouchPos = TouchEventDataToTouchPosData(ev.changedTouches[0]);
			if(!LongPressTimerValid)
			{
				LongPressPos = FirstTouchPos;
				setTimeout(
					function(){
						LongPressTimerValid = false;
						if(LongPressPos)
						{
							var cppContext = new CppContextHelper();
		 					cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
							cppContext.eventType  = MapJSEventLongPress;
							cppContext.screenX = LongPressPos.x;
							cppContext.screenY = LongPressPos.y;
							cppContext.AddParam(LongPressPos.id);
							cppContext.Serialize();
							LongPressExec = true;
							LongPressPos = null;
						}
					}
				, LONG_PRESS_TIME);
				LongPressTimerValid = true;
			}
		}
		else
		{
			LongPressPos = null;
		}

	}, false);

	mapdoc.addEventListener('touchmove', function(ev)
	{
		// idle イベントと対にさせるために DragBegin と PinchBegin は google.maps の dragstartイベントの後に送信する
		if(g_MapMoveGestureState == MapMoveGestureDrag)
		{
//			var tmpFingerPos = TouchEventDataToTouchPosData(ev.touches[0]);
//			if(!DragFingerPos || DragFingerPos.x != tmpFingerPos.x || DragFingerPos.y != tmpFingerPos.y)
			{
				if(g_UseMapMoveGesture)
				{
					var matrixpos = GetMatrixPos();
					if(matrixpos)
					{
						g_GestureMapMovePos.x = matrixpos.x - g_GestureMapMoveBasePos.x;
						g_GestureMapMovePos.y = matrixpos.y - g_GestureMapMoveBasePos.y;
						SendMapMoveGesture(MapJSEventDragMove);
					}
				}
//				DragFingerPos = tmpFingerPos;
			}

			if(!PinchPos)
			{
				if(ev.touches.length >= 2)
				{
					PinchPos = new Array();
					PinchPos[0] = TouchEventDataToTouchPosData(ev.touches[0]);
					PinchPos[1] = TouchEventDataToTouchPosData(ev.touches[1]);
	//				printf("[SEND][PINCH START] id=" + PinchPos[0].id + " x=" + PinchPos[0].x + " y=" + PinchPos[0].y + " id=" + PinchPos[1].id + " x=" + PinchPos[1].x + " y=" + PinchPos[1].y);

					var cppContext = new CppContextHelper();
					cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
					cppContext.eventType  = MapJSEventPinchBegin;
					cppContext.AddParam(PinchPos[0].id);
					cppContext.AddParam(PinchPos[0].x);
					cppContext.AddParam(PinchPos[0].y);
					cppContext.AddParam(PinchPos[1].id);
					cppContext.AddParam(PinchPos[1].x);
					cppContext.AddParam(PinchPos[1].y);
					cppContext.Serialize();
				}
			}
		}
	}, false);

	mapdoc.addEventListener('touchend', function(ev)
	{
		if(ev.touches.length == 0)
		{
			if(g_MapMoveGestureState == MapMoveGestureDrag)
			{
				var matrixpos = GetMatrixPos();
				if(matrixpos)
				{
					g_GestureMapMovePos.x = matrixpos.x - g_GestureMapMoveBasePos.x;
					g_GestureMapMovePos.y = matrixpos.y - g_GestureMapMoveBasePos.y;
				}
				SendMapMoveGesture(MapJSEventDragEnd);

				// MapMoveGestureを使用する場合はFlickの監視を行う。パフォーマンスに影響する。
				if(g_UseMapMoveGesture)
				{
					g_MapMoveGestureState = MapMoveGestureFlick;
					SendMapMoveGesture(MapJSEventFlickBegin);

					g_FlickCheckTimerId = setTimeout("UpdateFlickStatusFunc()",FLICK_CHECK_TIMER_INTERVAL);
				}
				else
				{
					g_MapMoveGestureState = MapMoveGestureNone;
				}
			}
		}
	
		if(ev.touches.length < 2)
		{
			if(PinchPos)
			{
//				printf("[SEND][PINCH END]changedTouches[" + ev.changedTouches.length + "],touches.length["+ ev.touches.length + "]");
				var FirstPos = null;
				var SecondPos = null;
				if(ev.changedTouches.length >= 1)
				{
					if(ev.touches.length >= 1)
					{
						FirstPos = TouchEventDataToTouchPosData(ev.touches[0]);
						SecondPos = TouchEventDataToTouchPosData(ev.changedTouches[0]);
					}
					else
					{
						FirstPos = TouchEventDataToTouchPosData(ev.changedTouches[0]);
						SecondPos = FirstPos;
						printf("[WARN]pinch end touches empty.");
					}
				}
				else
				{
					FirstPos = PinchPos[0];
					SecondPos = PinchPos[1];
					printf("[ERROR]pinch end changedTouches empty.");
				}
				var cppContext = new CppContextHelper();
				cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
				cppContext.eventType  = MapJSEventPinchEnd;
				cppContext.AddParam(FirstPos.id);
				cppContext.AddParam(FirstPos.x);
				cppContext.AddParam(FirstPos.y);
				cppContext.AddParam(SecondPos.id);
				cppContext.AddParam(SecondPos.x);
				cppContext.AddParam(SecondPos.y);
				cppContext.Serialize();

				PinchPos = null;
			}
		}

//		printf("[SEND][TOUCH END] id=" + ev.changedTouches[0].identifier + " x=" + ev.changedTouches[0].pageX + " y=" + ev.changedTouches[0].pageY);						
		{
			var cppContext = new CppContextHelper();
			cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
			cppContext.eventType  = MapJSEventTouchEnd;
			cppContext.screenX = ev.changedTouches[0].pageX;
			cppContext.screenY = ev.changedTouches[0].pageY;
			cppContext.AddParam(ev.changedTouches[0].identifier);
			cppContext.Serialize();

			if(FirstTouchPos && FirstTouchPos.id == ev.changedTouches[0].identifier)
			{
				FirstTouchPos = null;
				LongPressPos = null;
				LongPressExec = false;
			}
		}

	}, false);	
}

function RegistMapEvent()
{
	google.maps.event.addListener(g_map, 'tilesloaded', function() 
	{
		if(g_InitializeTileLoadingStatus == InitializeTileLoadingWithOtherLoading)
		{
			g_InitializeTileLoadingStatus = InitializeTileLoadingNone;
			return;
		}
		else if(g_InitializeTileLoadingStatus == InitializeTileLoading)
		{
			g_InitializeTileLoadingStatus = InitializeTileLoadingNone;
		}

		setTimeout(
			function(){
				var cppContext = new CppContextHelper();
		 		cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
				cppContext.eventType  = MapJSEventTilesLoaded;
				cppContext.atomicId = g_AtomicId;
				cppContext.Serialize();

				g_TileDirty = false;
		}
		, 50);	
		
	});   

	google.maps.event.addListener(g_map, 'idle', function()
	{
		if (g_TileDirty || g_searched)
		{
			if(g_InitializeTileLoadingStatus == InitializeTileLoadingWithOtherLoading)
			{
				g_InitializeTileLoadingStatus = InitializeTileLoadingNone;
				return;
			}
			else if(g_InitializeTileLoadingStatus == InitializeTileLoading)
			{
				g_InitializeTileLoadingStatus = InitializeTileLoadingNone;
			}

			setTimeout(
				function(){
					var cppContext = new CppContextHelper();
					cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
					cppContext.eventType  = MapJSEventTilesLoaded;
					cppContext.atomicId = g_AtomicId;
					cppContext.Serialize();
					g_TileDirty = false;
					g_searched = false;
				}
				, 50);
		}
	});

	google.maps.event.addListener(g_map, 'maptypeid_changed', function() 
	{
	});   

	google.maps.event.addListener(g_map, 'zoom_changed', function() 
	{
		NotifyZoomChanged();
	});   

	google.maps.event.addListener(g_map, 'center_changed', function() 
	{
		if(MAPVIEW_USE_V2_0_BROWSER && g_UseMapMoveGesture)
		{
			if(g_MapMoveGestureState == MapMoveGestureNone)
				NotifyCenterChanged();
		}
		else
		{
			NotifyCenterChanged();
		}
	});   

	if(!MAPVIEW_USE_V2_0_BROWSER)
	{	  
		google.maps.event.addListener(g_map, 'click', function(event) 
		{
			var markerInfo = g_markermanager.GetHitMarker(event.pixel);
			
			// marker click
			if(markerInfo && markerInfo.Obj)
			{
				g_markermanager.SelectMarker(markerInfo.Id);
				NotifySelectMarkerEvent(markerInfo.Id, markerInfo.Obj.getPosition());
			}
			else
			{
				var cppContext = new CppContextHelper();
	 			cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
				cppContext.eventType  = MapJSEventMapClicked;
				cppContext.screenX = event.pixel.x;
				cppContext.screenY = event.pixel.y;
				cppContext.Serialize();
			}
		});
	}
	else
	{
		RegistMapEventV2Browser();
	}

	google.maps.event.addListener(g_map, 'dragstart', function() 
	{
	});   

	google.maps.event.addListener(g_map, 'dragend', function() 
	{
	});   
}


///////////////////////////////////////////////////////
// API Function

///////////////////////////////////////////////////////
// Initialize
function Initialize(nativeParam, cppContext)
{
	if(CheckMapVersion(3, 6) == 0)
	{
		WORKAROUND_DISABLE_ANIMATION = false;
	}

	var initialLat 		= MapInitLatVal;
	var initialLng 		= MapInitLngVal;

	// 現在地が設定されている
	if(nativeParam.Center)
	{
		initialLat 		= nativeParam.Center.Lat;
		initialLng 		= nativeParam.Center.Lng;
	}

	var initZoom   		= nativeParam.ZoomLevel;
	var initialLatLng  	= new google.maps.LatLng(initialLat, initialLng); 
	var mapType  		= ConvertGoogleMapType(nativeParam.MapType);

	var Options = 
	{
		zoom: 					initZoom,
		minZoom:				MapZoomLevelMin,
		maxZoom:				MapZoomLevelMax,
		center: 				initialLatLng,
		mapTypeId: 				mapType,
		mapTypeControl: 		false,
		navigationControl: 		false,
		backgroundColor: 		MapBGColor,
		disableDoubleClickZoom: true,
		draggableCursor:		' ',
		draggingCursor:			' ',
		keyboardShortcuts:		false,
		scrollwheel:			false,
		streetViewControl:		false,
		scaleControl:			false,
		reportErrorControl: 	false,
        panControl:             false,
        rotateControl:			false,
        zoomControl:            false
	};

	var	mapview = document.getElementById(MapView_ID);
	
	if(g_map)
	{
		g_map.setOptions(Options);
	}
	else
	{
		g_map = new google.maps.Map(mapview, Options);

		g_height = mapview.clientHeight;
		g_width  = mapview.clientWidth;

		// 地図のイベントを登録
		RegistMapEvent();
		insertTileLayer();
	}

	if(!g_projectionHelper)
	{
		g_projectionHelper = new ProjectionHelper(g_map);
	}

	if(!g_markermanager)
	{
		g_markermanager = new MarkerGroupManager(g_map);
	}
	else
	{
		g_markermanager.RemoveAllMarkers();
	}
	
	// 経路データを削除
	MapClearDirectionData();

	g_markermanager.CreateCurrentPosIcon();
	
	var bInitializeSearch = parseBool(nativeParam.InitializeSearch);

	if(bInitializeSearch)
	{
		if(!g_PlacesService)
			g_PlacesService = new google.maps.places.PlacesService(GetPlacesMap());

		if(!g_Geocoder)
			g_Geocoder = new google.maps.Geocoder();

		if(!g_DirectionsService)
		{
			g_DirectionsService = new google.maps.DirectionsService();
			// bug 57871 対応。経路検索の初回実行時にネットワークが接続されていないと
			// 応答が返ってこなくなるため、接続状態のうちに経路検索を1回行っておく。
			dummyDirection();
		}
	}

	// Near用のドラッグ中の移動量を返す MapMoveGesture イベントを使用するかどうか
	g_UseMapMoveGesture = parseBool(nativeParam.UseMapMoveGesture);

	// 現在地アイコン設定
	var visible		= parseBool(nativeParam.CurrentPosIcon.Visible);
	var lat			= nativeParam.CurrentPosIcon.Pos.Lat;
	var lng			= nativeParam.CurrentPosIcon.Pos.Lng;
	var latlng		= new google.maps.LatLng(lat,lng);

	g_markermanager.ShowMarker(CURRENT_POS_ICON_ID,visible);
	g_markermanager.MoveMarker(CURRENT_POS_ICON_ID,latlng);

	// 誤差サークル設定
	var radius		= nativeParam.AccuracyCircle.Radius;
	g_markermanager.UpdateCurPosAccuracy(radius, latlng);

	var select_id = null;

	if(nativeParam.MarkerList != undefined)
	{
		// Marker追加
		for( var i = 0; i < nativeParam.MarkerList.length; i++ )
		{
			var lat			= nativeParam.MarkerList[i].Pos.Lat;
			var lng			= nativeParam.MarkerList[i].Pos.Lng;
			var latLng		= new google.maps.LatLng(lat,lng);
			var markerType	= nativeParam.MarkerList[i].MarkerType;
			var markerId	= nativeParam.MarkerList[i].MarkerId;
			var visible		= parseBool(nativeParam.MarkerList[i].Visible);

			g_markermanager.AddMarkerData(markerId,markerType,latLng,visible);

			if(nativeParam.MarkerList[i].Select)
				select_id = markerId;
		}
	}

	g_markermanager.UpdateMarkerZIndex();
	g_markermanager.SelectMarker(select_id);

	g_temperatureUnits	= ConvertGoogleUnitTemperature(nativeParam.Temperature);
	g_windSpeedUnits	= ConvertGoogleUnitWindSpeed(nativeParam.WindSpeed);

	{
		// Layer
		var modifylayerParam = new Object;
		modifylayerParam.AddLayer = nativeParam.LayerType;
		MapModifyLayer(modifylayerParam);
		delete modifylayerParam;
	}

	// Zoom値・中心位置を設定する	
	var latlang = g_map.getCenter();
	cppContext.Lat = latlang.lat();
	cppContext.Lng = latlang.lng();
	cppContext.zoom = g_map.getZoom();
	
	g_InitializeTileLoadingStatus = InitializeTileLoading;
}

function dummyDirection()
{
	var requestParam = {
		origin: 	 new google.maps.LatLng(0,0),
		destination: new google.maps.LatLng(0,0), 
		travelMode:  google.maps.DirectionsTravelMode.WALKING,
		unitSystem:  google.maps.UnitSystem.METRIC,
		region: 	 g_RegionMap[g_Language],
	};
	g_DirectionsService.route(requestParam, function(result, status){
//		var mes = "Dummy Direction status" + "[" + status + "]";
//		printf(mes);
	});
}

function insertTileLayer()
{
	var tileLayer = new google.maps.ImageMapType(
	{
		getTileUrl: function(tile, zoom)
		{
			return;
		},
		tileSize: new google.maps.Size(256, 256)
	});

	tileLayer.baseGetTile = tileLayer.getTile;
	tileLayer.getTile = function(tileCoord, zoom, ownerDocument)
	{
		var node = tileLayer.baseGetTile(tileCoord, zoom, ownerDocument);
		//	node.firstChild.onload = OnSingleTileLoaded;

		if(zoom != 2)
		{
			g_TileDirty = false;
		}
		return node;
	};

	g_map.overlayMapTypes.insertAt(0, tileLayer);
}

///////////////////////////////////////////////////////
// SetZoom

function MapSetZoom(nativeParam, cppContext)
{
	internal_set_Zoom_Center(nativeParam.ZoomLevel);
	cppContext.zoom = g_map.getZoom();
}

function MapSetZoomOffset(nativeParam, cppContext)
{
	var newZoom = g_map.getZoom() + nativeParam.Offset;
	internal_set_Zoom_Center(newZoom);
	cppContext.zoom = g_map.getZoom();
}

function MapSetZoomCenter(nativeParam, cppContext)
{
	g_TileDirty = true;
	g_AtomicId = cppContext.atomicId;
	var paramZoomVal   = nativeParam.ZoomLevel;
	var center_new_css = new google.maps.Point(nativeParam.NewZoomCenter.CssX, nativeParam.NewZoomCenter.CssY); 

    if(nativeParam.BaseZoomCenter != undefined)	
    {
    	var center_css     = new google.maps.Point(nativeParam.BaseZoomCenter.CssX, nativeParam.BaseZoomCenter.CssY); 
    	ChangeZoom_MoveCenter_CSS(paramZoomVal, center_css, center_new_css);
    	delete center_css;
    }
    else
    {
    	ChangeZoom_Center_CSS(paramZoomVal, center_new_css);
    }
	
	cppContext.zoom = g_map.getZoom();
	delete center_new_css;
}

///////////////////////////////////////////////////////
// SetType

function MapSetType(nativeParam)
{
	g_map.setMapTypeId(ConvertGoogleMapType(nativeParam.MapType));
}

///////////////////////////////////////////////////////
// SetCenter

function MapSetCenter(nativeParam)
{
	var lat = nativeParam.Center.Lat;
	var lng = nativeParam.Center.Lng;
	var latlng = new google.maps.LatLng(lat, lng);
	g_map.setCenter(latlng);
}

function MapSetCenterWithPixel(nativeParam)
{
	g_tilesLoaded = 0;
	var center_css     = new google.maps.Point(nativeParam.PixelCenter.CssX, 
							nativeParam.PixelCenter.CssY); 
							
	var center_latlng  = fromPixelToLatLng(center_css);
//	var center_latlng  = g_projectionHelper.getProjection().fromDivPixelToLatLng(center_css);
	g_map.setCenter(center_latlng);
}

function MapMovePixel(nativeParam)
{
	var MoveX = nativeParam.MoveX;
	var MoveY = nativeParam.MoveY;
	
	g_TileDirty = true;
	g_map.panBy(MoveX,MoveY);
}

function MapRefreshTiles(nativeParam)
{
	if(WORKAROUND_DISABLE_ANIMATION == false)
	{
	    if(g_refresh_workaround == false)
	    {
		    var prevZoom = g_map.getZoom();
		    g_refresh_workaround = true;

		    var zoomset = 1;
		    if (MapZoomLevelMax == prevZoom)
		    {
		        zoomset = -1;
		    }
		
		    g_map.setZoom(prevZoom + zoomset);
		    setTimeout(
			    function()
			    { 
				    var newZoomlevel = g_map.getZoom();
				    g_map.setZoom(prevZoom);
				    g_refresh_workaround = false;
			    }
			, 300);
	    }
		nativeParam.Error = 0;
	}
	else
	{
	    if(g_refresh_workaround == false)
	    {
			g_refresh_workaround = true;
			Reconstruction(g_map.getZoom(), g_map.getCenter());
			g_refresh_workaround = false;
		}
	}
}

///////////////////////////////////////////////////////
// ModifyLayer

function MapModifyLayer(nativeParam)
{
	var addLayer    = nativeParam.AddLayer;
	var removeLayer = nativeParam.RemoveLayer;
    
	// Add    
	// Traffic Layer
	if(addLayer & MapLayerType_Traffic)
	{
		if(!g_trafficLayer)
		{
			g_trafficLayer = new google.maps.TrafficLayer();
		}
		g_trafficLayer.setMap(g_map);
	}
	
	if(CheckMapVersion(3, 8) >= 0)
	{
		if(addLayer & MapLayerType_Weather)
		{
			if(!g_weatherLayer)
			{
				var InitOptions = 
				{
					clickable:	false,
				};
				g_weatherLayer = new google.maps.weather.WeatherLayer(InitOptions);
			}

			var Options = 
			{
				temperatureUnits:	g_temperatureUnits,
				windSpeedUnits:		g_windSpeedUnits
			};

			g_weatherLayer.setOptions(Options);
			g_weatherLayer.setMap(g_map);
		}

		if(addLayer & MapLayerType_Cloud)
		{
			if(!g_cloudLayer)
			{
				g_cloudLayer = new google.maps.weather.CloudLayer();
			}
			
			g_cloudLayer.setMap(g_map);
		}
	}

	// Remove
	if(removeLayer & MapLayerType_Traffic)
	{
		if(g_trafficLayer)
		{
			g_trafficLayer.setMap(null);
		}
	}
	
	if(CheckMapVersion(3, 8) >= 0)
	{
		if(removeLayer & MapLayerType_Weather)
		{
			if(g_weatherLayer)
			{
				g_weatherLayer.setMap(null);
			}
		}

		if(removeLayer & MapLayerType_Cloud)
		{
			if(g_cloudLayer)
			{
				g_cloudLayer.setMap(null);
			}
		}
	}
}

///////////////////////////////////////////////////////
// FitBounds

function MapFitBounds(nativeParam)
{
	var BoundsRect 		= null;
	var FitCenterLatLng = null;

	var len = nativeParam.PosList.length;
	
	for( var i = 0; i < len; i++) 
	{
		var lat         = nativeParam.PosList[i].Lat;
		var lng         = nativeParam.PosList[i].Lng;
		var latLng		= new google.maps.LatLng(lat,lng);

		if(nativeParam.PosList.length == 1)
		{
			FitCenterLatLng = latLng;
		}
		else
		{
			if(!BoundsRect)
			{
				BoundsRect = new google.maps.LatLngBounds();
			}

			BoundsRect.extend(latLng);
		}
	}
	
	if(BoundsRect)
	{
		var margin  = new Rect(nativeParam.Margin.Left, nativeParam.Margin.Top, nativeParam.Margin.Right, nativeParam.Margin.Bottom);
		internal_FitBounds(BoundsRect, margin);
		delete margin;
	}
	else if(FitCenterLatLng)
	{
		FitCenter(FitCenterLatLng);
	}
}

function AdjustFitBounds(BoundsRect, ViewArea)
{
	var zoom_level = g_map.getZoom();
	
	if(!BoundsRect)
		return zoom_level;

	if(ViewArea.left < 0 || ViewArea.right > g_width || ViewArea.top < 0 || ViewArea.bottom > g_height)
		return zoom_level;

	if(ViewArea.left > ViewArea.right || ViewArea.top > ViewArea.bottom)
		return MapZoomLevelMin;

	var bounds_pos_ne = fromLatLngToPixel(BoundsRect.getNorthEast());
	var bounds_pos_sw = fromLatLngToPixel(BoundsRect.getSouthWest());
	var BoundsArea    = new Rect(bounds_pos_sw.x, bounds_pos_ne.y, bounds_pos_ne.x, bounds_pos_sw.y);
	
	var adjust = false;
	
	if(MapZoomLevelMin < zoom_level)
	{
		if(ViewArea.top > BoundsArea.top)
			adjust = true;

		if(ViewArea.bottom < BoundsArea.bottom)
			adjust = true;

		if(ViewArea.left > BoundsArea.left)
			adjust = true;

		if(ViewArea.right < BoundsArea.right)
			adjust = true;
	}
	
	if(adjust)
	{
		g_map.setZoom(zoom_level - 1);
		return AdjustFitBounds(BoundsRect, ViewArea);
	}

	return zoom_level;
}

function internal_FitBounds(BoundsRect, Margin)
{
	if(!BoundsRect)
		return;

	var oldzoom  = g_map.getZoom();

	var ViewArea  = new Rect(
			Margin.left, 
			Margin.top + FLAG_HEIGHT,
			g_width  - Margin.right,
			g_height - Margin.bottom);

	g_fitBounds = true;
	g_map.fitBounds(BoundsRect);

	var zoom = AdjustFitBounds(BoundsRect, ViewArea);

	internal_set_Zoom_Center(zoom, g_map.getCenter(), IsZoomAnimation(oldzoom, zoom));

	g_fitBounds = false;
	NotifyCenterChanged()
	NotifyZoomChanged();
	delete ViewArea;
}	

function FitCenter(latlng)
{
	internal_set_Zoom_Center(MapZoomLevelFitBoundsMax, latlng);
}

function GetCurrentCSSPos()
{
	if(g_markermanager)
	{
		var info = g_markermanager.GetMarkerInfo(CURRENT_POS_ICON_ID);

		if(info && info.Obj && info.Obj.getVisible())
		{
			return fromLatLngToPixel(info.Obj.getPosition());
		}
	}

	return null;
}

//--------------CurrentPosition------------------
function MapUpdateCurrentPositionIcon(nativeParam, cppContext)
{
	var visible		= parseBool(nativeParam.CurrentPosIcon.Visible);
	var lat			= nativeParam.CurrentPosIcon.Pos.Lat;
	var lng			= nativeParam.CurrentPosIcon.Pos.Lng;
	var latlng		= new google.maps.LatLng(lat,lng);
	var radius		= nativeParam.AccuracyCircle.Radius;
	var center		= parseBool(nativeParam.CurrentPosIcon.Center);

	g_markermanager.UpdateCurPosAccuracy(radius, latlng);
	g_markermanager.MoveMarker(CURRENT_POS_ICON_ID, latlng);
	g_markermanager.ShowMarker(CURRENT_POS_ICON_ID, visible);

	if(center)
	{
		g_map.setCenter(latlng);
		g_TileDirty = true;
	}

	var currentPos = GetCurrentCSSPos();

	if(currentPos)
	{
		cppContext.screenX = currentPos.x;
		cppContext.screenY = currentPos.y;
	}
}


//--------------Marker------------------

function UpdateMarker(nativeParam, cppContext)
{
	var markerId = nativeParam.MarkerId;
	var latlng	 = null;
	
	if(nativeParam.Pos)
	{
		var pos 	= new google.maps.Point(nativeParam.Pos.CssX, nativeParam.Pos.CssY);
		latlng		= fromPixelToLatLng(pos);
		g_markermanager.MoveMarker(markerId, latlng);
	}
	else
	{
		var info = g_markermanager.GetMarkerInfo(markerId);

		if(info)
		{
			latlng = info.Obj.getPosition();
		}
	}

	if(nativeParam.Visible != undefined)
	{
		g_markermanager.ShowMarker(markerId, parseBool(nativeParam.Visible));
	}

	if(nativeParam.Select != undefined)
	{
		if(nativeParam.Select)
		{
			g_markermanager.SelectMarker(markerId);
			
			if(latlng && nativeParam.SelectNotify != undefined && nativeParam.SelectNotify != 0)
			{
				NotifySelectMarkerEvent(markerId, latlng);
			}
		}
		else
		{
			g_markermanager.SelectMarker(null);
		}
	}
	
	if(latlng)
	{
		cppContext.Lat = latlng.lat();
		cppContext.Lng = latlng.lng();
		cppContext.markerId = markerId;
	}
	else
	{
		cppContext.retValue = MAP_RESULT_GENERIC_ERROR;
	}
}

function MapMoveToMarker(nativeParam)
{
	var markerId    = nativeParam.MarkerId;
	var info        = g_markermanager.GetMarkerInfo(markerId);

	if(info)
	{
		g_TileDirty = true;
		g_map.setCenter(info.Obj.getPosition());
		g_markermanager.SelectMarker(markerId);
		
		if(nativeParam.ZoomLevel != undefined)
		{
		    var zoomLevel = nativeParam.ZoomLevel;
			internal_set_Zoom_Center(zoomLevel);
		}
	}
}

function MapMoveToCurrentPositionIcon(nativeParam)
{
	var markerId    = CURRENT_POS_ICON_ID;
	var info        = g_markermanager.GetMarkerInfo(markerId);

	if(info)
	{
		g_TileDirty = true;
		g_map.setCenter(info.Obj.getPosition());
		g_markermanager.SelectMarker(markerId);
		
		if(nativeParam.ZoomLevel != undefined)
		{
		    var zoomLevel = nativeParam.ZoomLevel;
			internal_set_Zoom_Center(zoomLevel);
		}
	}
}

function MapAddMarkerList(nativeParam)
{
	g_searched = true;
	var SetCenter = false;
	if(nativeParam.Center == 1 && nativeParam.MarkerList.length == 1)
		SetCenter = true;

	var select_id = null;
	
	for( var i = 0; i < nativeParam.MarkerList.length; i++ )
	{
		var lat			= nativeParam.MarkerList[i].Pos.Lat;
		var lng			= nativeParam.MarkerList[i].Pos.Lng;
		var latLng		= new google.maps.LatLng(lat,lng);
		var markerType	= nativeParam.MarkerList[i].MarkerType;
		var markerId	= nativeParam.MarkerList[i].MarkerId;
		var visible		= parseBool(nativeParam.MarkerList[i].Visible);

		g_markermanager.AddMarkerData(markerId,markerType,latLng,visible);

		if (SetCenter)
			g_map.setCenter(latLng);

		if(nativeParam.MarkerList[i].Select)
			select_id = markerId;
	}
	
	if(nativeParam.Viewport)
	{
		var sw = new google.maps.LatLng(nativeParam.Viewport.SW.Lat, nativeParam.Viewport.SW.Lng);
		var ne = new google.maps.LatLng(nativeParam.Viewport.NE.Lat, nativeParam.Viewport.NE.Lng);
		BoundsRect = new google.maps.LatLngBounds(sw, ne);

		var margin  = new Rect(nativeParam.Margin.Left, nativeParam.Margin.Top, nativeParam.Margin.Right, nativeParam.Margin.Bottom);
		internal_FitBounds(BoundsRect, margin);
		delete margin;
	}
	else if(nativeParam.FitBoundsList)
	{
		var BoundsRect 		= null;
		var FitCenterLatLng = null;
		var len = nativeParam.FitBoundsList.length;
		
		for( var i = 0; i < len; i++ )
		{
			var lat			= nativeParam.FitBoundsList[i].Pos.Lat;
			var lng			= nativeParam.FitBoundsList[i].Pos.Lng;
			var latLng		= new google.maps.LatLng(lat,lng);

			if(nativeParam.FitBoundsList.length == 1)
			{
				FitCenterLatLng = latLng;
			}
			else
			{
				if(!BoundsRect)
				{
					BoundsRect = new google.maps.LatLngBounds();
				}

				BoundsRect.extend(latLng);
			}
		}
		
		if(BoundsRect)
		{
			var margin  = new Rect(nativeParam.Margin.Left, nativeParam.Margin.Top, nativeParam.Margin.Right, nativeParam.Margin.Bottom);
			internal_FitBounds(BoundsRect, margin);
			delete margin;
		}
		else if(FitCenterLatLng)
		{
			FitCenter(FitCenterLatLng);
		}
	}

	g_markermanager.UpdateMarkerZIndex();

	if(select_id != null)
	{
		g_markermanager.SelectMarker(select_id);
	}
}

function MapRemoveMarker(nativeParam)
{
	var markerId	= nativeParam.MarkerId;
	g_markermanager.RemoveMarker(markerId);
}

function MapRemoveMarkers(nativeParam)
{
	for(var i = 0;i < nativeParam.MarkerIdList.length;++i)
	{
		var markerId	= nativeParam.MarkerIdList[i];
		g_markermanager.RemoveMarker(markerId);
	}
}

function MapRemoveMarkerGroup(nativeParam)
{
	var markerType	= nativeParam.MarkerType;
	g_markermanager.RemoveMarkerGroup(markerType);
}

function MapShowMarkerGroup(nativeParam)
{
	var markerType	= nativeParam.MarkerType;
	var visible		= parseBool(nativeParam.Visible)
	g_markermanager.ShowMarkerGroup(markerType,visible);
}

function MapSelectMarker(nativeParam)
{
	var markerId = nativeParam.MarkerId;
	var info     = g_markermanager.GetMarkerInfo(markerId);

	if(!info)
		return;

	if(g_markermanager.SelectId != undefined && g_markermanager.SelectId == markerId)
	{
		if(!nativeParam.Select)
		{
			g_markermanager.SelectMarker(null);
		}
	}
	else
	{
		if(nativeParam.Select)
		{
			g_markermanager.SelectMarker(markerId);
		}
	}
}

function MapSelectCurrentPositionIcon(nativeParam)
{
	nativeParam.MarkerId = CURRENT_POS_ICON_ID;
	MapSelectMarker(nativeParam);
}

function MapUnselect(nativeParam)
{
	g_markermanager.SelectMarker(null);
}

function MapSetDirectionData(nativeParam)
{
	g_searched = true;
	MapClearDirectionData();

	var DecodedData = DirectionDataDecode(nativeParam.PolylineList);
    g_DirectionLine = new google.maps.Polyline({
                            clickable: false,
                            geodesic :false,
                            map: g_map,
                            path: DecodedData.LineData,       
                            strokeColor: '#DD00FF',       
                            strokeOpacity: 0.7,
                            strokeWeight: 5,
                            zIndex: ZIndex_Direction_Line
                            });
                            

    // 経路検索結果のマーカーをセットする	
	if(nativeParam.MarkerList != undefined)
	{
		var BoundsRect 		= null;
		var FitCenterLatLng = null;

		// Marker追加
		for( var i = 0; i < nativeParam.MarkerList.length; i++ )
		{
			var lat			= nativeParam.MarkerList[i].Pos.Lat;
			var lng			= nativeParam.MarkerList[i].Pos.Lng;
			var latLng		= new google.maps.LatLng(lat,lng);
			var markerType	= nativeParam.MarkerList[i].MarkerType;
			var markerId	= nativeParam.MarkerList[i].MarkerId;
			var visible		= parseBool(nativeParam.MarkerList[i].Visible);

			g_markermanager.AddMarkerData(markerId,markerType,latLng,visible);

			if(nativeParam.MarkerList[i].Select) {
				select_id = markerId;
			}

			if(nativeParam.MarkerList.length == 1)
			{
				FitCenterLatLng = latLng;
			}
			else
			{
				if(!BoundsRect)
				{
					BoundsRect = new google.maps.LatLngBounds();
				}

				BoundsRect.extend(latLng);
			}
		}

        g_markermanager.UpdateMarkerZIndex();

		if(BoundsRect)
		{
			var margin  = new Rect(nativeParam.Margin.Left, nativeParam.Margin.Top, nativeParam.Margin.Right, nativeParam.Margin.Bottom);
			internal_FitBounds(BoundsRect, margin);
			delete margin;
		}
		else if(FitCenterLatLng)
		{
			FitCenter(FitCenterLatLng);
		}
	}
}

function MapClearDirectionData()
{
	if(g_DirectionLine)
	{
		g_DirectionLine.setMap(null);
		delete g_DirectionLine;
		g_DirectionLine = null;		
	}
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_Step);
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_Start);
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_End);
}

function RouteInfo(line, fitbounds_margin)
{
	this.line 			  = line;
	this.fitbounds_margin = fitbounds_margin;
}

function MapApplyRoute(nativeParam, cppContext)
{
	var requestId = nativeParam.RequestId;

	// Cancel
	if(nativeParam.MarkerList == undefined)
	{
		if(g_RouteLineData[requestId])
		{
			delete g_RouteLineData[requestId];
		}
		return;
	}

	g_searched = true;
	MapClearDirectionData();
	
	if(g_RouteLineData[requestId])
	{
	    g_DirectionLine = new google.maps.Polyline({
	                            clickable: false,
	                            geodesic :false,
	                            map: g_map,
	                            path: g_RouteLineData[requestId].line,
	                            strokeColor: '#DD00FF',
	                            strokeOpacity: 0.7,
	                            strokeWeight: 5,
	                            zIndex: ZIndex_Direction_Line
	                            });
	                            
	    // 経路検索結果のマーカーをセットする	
		if(nativeParam.MarkerList != undefined)
		{
			var BoundsRect 		= null;
			var FitCenterLatLng = null;

			// Marker追加
			for( var i = 0; i < nativeParam.MarkerList.length; i++ )
			{
				var lat			= nativeParam.MarkerList[i].Pos.Lat;
				var lng			= nativeParam.MarkerList[i].Pos.Lng;
				var latLng		= new google.maps.LatLng(lat,lng);
				var markerType	= nativeParam.MarkerList[i].MarkerType;
				var markerId	= nativeParam.MarkerList[i].MarkerId;
				var visible		= true

				g_markermanager.AddMarkerData(markerId,markerType, latLng, visible);

				if(nativeParam.MarkerList.length == 1)
				{
					FitCenterLatLng = latLng;
				}
				else
				{
					if(!BoundsRect)
					{
						BoundsRect = new google.maps.LatLngBounds();
					}

					BoundsRect.extend(latLng);
				}
			}

	        g_markermanager.UpdateMarkerZIndex();

			if(BoundsRect)
			{
				internal_FitBounds(BoundsRect, g_RouteLineData[requestId].fitbounds_margin);
			}
			else if(FitCenterLatLng)
			{
				FitCenter(FitCenterLatLng);
			}
		}

		delete g_RouteLineData[requestId];
	}
}

function AsyncRequest(nativeParam, _cppContext)
{
	this.cancel = false;

	this.cppContext = new CppContextHelper();
	this.cppContext.eventType  = _cppContext.eventType;
	this.cppContext.functionId = _cppContext.functionId;
	this.cppContext.atomicId   = _cppContext.atomicId;
	this.atomicId = _cppContext.atomicId;

	this.Execute = function()
	{
		printf("Execute Function(not Implement)");
	}
	
	this.Cancel = function()
	{
		this.cancel = true

		if(this.cppContext)
		{
			this.cppContext.AddParam("Cancel");
			this.cppContext.retValue = MAP_RESULT_SUCCESS;
		}

		this.Finalize();
	}

	this.Finalize = function()
	{
		if(this.cppContext)
		{
			this.cppContext.Serialize();
			delete this.cppContext;
			this.cppContext = null;
		}
	
		g_AsyncRequest[this.atomicId] = null;
		delete g_AsyncRequest[this.atomicId];
	}
}

function MapRequestRoute(nativeParam, cppContext)
{
	AsyncRequest.apply(this, [nativeParam, cppContext]);

	var from 	= null;
	var to 		= null;
	var mode   	= google.maps.DirectionsTravelMode.WALKING;
	var unit   	= google.maps.UnitSystem.METRIC;

	if(nativeParam.FromPos != undefined)
	{
		from = new google.maps.LatLng(nativeParam.FromPos.Lat, nativeParam.FromPos.Lng);
	}
	else
	{
		from = nativeParam.From;
	}

	if(nativeParam.ToPos != undefined)
	{
		to = new google.maps.LatLng(nativeParam.ToPos.Lat, nativeParam.ToPos.Lng);
	}
	else
	{
		to = nativeParam.To;
	}

	if(nativeParam.Unit == MapUnitMiles)
	{
		unit = google.maps.UnitSystem.IMPERIAL;
	}

	if(nativeParam.Mode == MapTravelModeDriving)
	{
		mode = google.maps.DirectionsTravelMode.DRIVING;
	}
	
	this.requestParam = {
	    origin: 	 from,
	    destination: to, 
	    travelMode:  mode,
	    unitSystem:  unit,
	    region: 	 g_RegionMap[g_Language],
	}; 
	
	this.Execute = function()
	{
		var RequestObj = this;
		g_AsyncRequest[this.atomicId] = RequestObj;
		
		if(!g_DirectionsService)
			g_DirectionsService = new google.maps.DirectionsService();

		g_DirectionsService.route(this.requestParam, function(result, status)
		{ 
			if(RequestObj.cppContext && RequestObj.cancel == false)
			{
				// Status
				RequestObj.cppContext.AddParam(status);
				RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;

				if (status == google.maps.DirectionsStatus.OK) 
				{ 
					var routes 		= result.routes[0];
					var legs 		= routes.legs[0];
					var stepCount 	= legs.steps.length;
					
					// Step数チェック
					if(stepCount <= MAP_DIRECTION_STEPS_MAX)
					{
						// Summary
						RequestObj.cppContext.AddParam(routes.summary);

						// Copyright
						RequestObj.cppContext.AddParam(routes.copyrights);

						// Warning数
						RequestObj.cppContext.AddParam(routes.warnings.length);

						var warnings_len = routes.warnings.length;
						// Warning
						for(var i = 0; i < warnings_len; i++)
						{
							// Warning
							RequestObj.cppContext.AddParam(routes.warnings[i]);
						}
				
						// StartAddress
						RequestObj.cppContext.AddParam(legs.start_address);

						// StartLocation
						RequestObj.cppContext.AddParam(legs.start_location.lat());
						RequestObj.cppContext.AddParam(legs.start_location.lng());

						// EndAddress
						RequestObj.cppContext.AddParam(legs.end_address);

						// EndLocation
						RequestObj.cppContext.AddParam(legs.end_location.lat());
						RequestObj.cppContext.AddParam(legs.end_location.lng());

						// Distance
						RequestObj.cppContext.AddParam(legs.distance.text);
						RequestObj.cppContext.AddParam(legs.distance.value);

						// Duration
						RequestObj.cppContext.AddParam(legs.duration.text);
						RequestObj.cppContext.AddParam(legs.duration.value);

						// Step数
						RequestObj.cppContext.AddParam(stepCount);

						var RouteLineData = new Array();

						// Step
						for(var i = 0; i < stepCount; i++)
						{
							var step = legs.steps[i];
							
							RouteLineData = RouteLineData.concat(step.path);
							
							// instructions
							RequestObj.cppContext.AddParam(step.instructions);

							// location
							RequestObj.cppContext.AddParam(step.start_location.lat());
							RequestObj.cppContext.AddParam(step.start_location.lng());

							// Distance
							RequestObj.cppContext.AddParam(step.distance.text);
							RequestObj.cppContext.AddParam(step.distance.value);

							// Duration
							RequestObj.cppContext.AddParam(step.duration.text);
							RequestObj.cppContext.AddParam(step.duration.value);
						}

						var margin  = new Rect(nativeParam.Margin.Left, nativeParam.Margin.Top, nativeParam.Margin.Right, nativeParam.Margin.Bottom);
						g_RouteLineData[RequestObj.cppContext.atomicId] = new RouteInfo(RouteLineData, margin);
					}
					else
					{
						RequestObj.cppContext.retValue = MAP_RESULT_MAX_STEPS_EXCEEDED;
					}
				}

				RequestObj.Finalize();
			}
		});
	}
}

function DirectionDataDecode(PolylineList) 
{
	var LineData = [];

	for(var i = 0;i < PolylineList.length;++i)
	{
		var steppoints = PolylineList[i].Points;

		steppoints = steppoints.replace( /&bksp;/g, '\\');
//		steppoints = steppoints.replace(/\\\\/g, "\\");

		DirectionDecodeLineData(steppoints,LineData);
	}

	var DecodedData = new Object();
	DecodedData['LineData']		= LineData;
	return DecodedData;
}

// for algorithm
function DirectionDecodeLineData(encoded,enc_points)
{
	if (encoded == null)
		return;
	var len = encoded.length;
	var index = 0;
	var lat = 0;
	var lng = 0;

	while (index < len) 
	{
		var b;
		var shift = 0;
		var result = 0;
		do
		{
			if (index>=len)
			{
				break;
			}

			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lat += dlat;
		shift = 0;
		result = 0;
		do
		{
			if (index>=len)
			{
				break;
			}

			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lng += dlng;
		
		var fixlat = lat * 1e-5;
		var fixlng = lng * 1e-5;
		var latlng = new  google.maps.LatLng(fixlat, fixlng);
		enc_points.push(latlng);
	}
}

function DirectionDecodeLevelData(encoded,enc_levels)
{
	var maxLevel = 0;
	if (encoded == null)
		return;

	for (var pointIndex = 0; pointIndex < encoded.length; ++pointIndex)
	{
		var pointLevel = encoded.charCodeAt(pointIndex) - 63;
		if (maxLevel < pointLevel)
			maxLevel = pointLevel;
		enc_levels.push(pointLevel);
	}
}

function MapRequestGeocode(nativeParam, cppContext)
{
	AsyncRequest.apply(this, [nativeParam, cppContext]);

	var pos;

	if(nativeParam.Pos != undefined)
		pos = new google.maps.LatLng(nativeParam.Pos.Lat,nativeParam.Pos.Lng);

	this.requestParam = { 
	    address:	nativeParam.Address,
	    location:	pos,
	    region:		g_RegionMap[g_Language],
	}; 

	this.Execute = function()
	{
		var RequestObj = this;
		g_AsyncRequest[this.atomicId] = RequestObj;

		// Geocode検索を行う
		if(!g_Geocoder)
			g_Geocoder = new google.maps.Geocoder();

		g_Geocoder.geocode(this.requestParam, function(result, status) 
		{
			if(RequestObj.cppContext && RequestObj.cancel == false)
			{
				// Status
				RequestObj.cppContext.AddParam(status);
				RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;
			
				if (status == google.maps.GeocoderStatus.OK) 
				{
					var ResultCount = result.length;
					
					// リバースジオコードの場合、結果は一つしか返さない
					if(RequestObj.cppContext.functionId == MAP_JSCALL_REVERSE_GEOCODE_REQUEST_ID)
						ResultCount = 1;
						
					RequestObj.cppContext.AddParam(ResultCount);

					for(var i = 0;i < ResultCount;++i)
					{
						RequestObj.cppContext.AddParam(result[i].formatted_address);
						RequestObj.cppContext.AddParam(result[i].geometry.location.lat());
						RequestObj.cppContext.AddParam(result[i].geometry.location.lng());
						RequestObj.cppContext.AddParam(result[i].geometry.location_type);

						var ComponentsCount = result[i].address_components.length;
						RequestObj.cppContext.AddParam(ComponentsCount);

						for(var j = 0;j < ComponentsCount;++j)
						{
							RequestObj.cppContext.AddParam(result[i].address_components[j].long_name);
							RequestObj.cppContext.AddParam(result[i].address_components[j].short_name);
							
							var TypesCount = result[i].address_components[j].types.length;
							RequestObj.cppContext.AddParam(TypesCount);

							for(var k = 0;k < TypesCount;++k)
							{
								RequestObj.cppContext.AddParam(result[i].address_components[j].types[k]);
							}
						}
					}
					RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;
				}

				RequestObj.Finalize();
			}
		}); 
	}
}

function GetPlacesMap()
{
	if(!g_dummy_map)
	{
		var myOptions = {
			zoom: 2,
			center: new google.maps.LatLng(0,0),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		g_dummy_map = new google.maps.Map(document.getElementById(Dummy_MapView_ID), myOptions);
	}

	return g_dummy_map;
}

function DecodeTypes(TypeArray)
{
	var FormattedTypes;
	if(!TypeArray)
		return FormattedTypes;

	for(var i = 0;i < TypeArray.length;++i)
	{
		if(i == 0)
			FormattedTypes = "";
		else
			FormattedTypes += "|";
		FormattedTypes += TypeArray[i];
	}
	return FormattedTypes;
}

// bug 59688 の workarownd 用にネットワーク未接続の場合に手動で
// タイムアウトを行う際のタイムアウト時間
const SEARCH_TIMEOUT = 25 * 1000;

// PlacesTextSearch と共用
function MapRequestPlacesSearch(nativeParam, cppContext)
{
	AsyncRequest.apply(this, [nativeParam, cppContext]);

	var CenterPos;
	var Radius;
	var FormattedTypes = DecodeTypes(nativeParam.Types);
	if(nativeParam.Pos != undefined)
	{
		CenterPos = new google.maps.LatLng(nativeParam.Pos.Lat,nativeParam.Pos.Lng);
		Radius = nativeParam.Radius;
	}

	this.requestParam = {
		query:		nativeParam.TextQuery,
		keyword:	nativeParam.Keyword,
		name:		nativeParam.Name,
		location:	CenterPos,
		radius:		Radius,
	};

	if(FormattedTypes != undefined)
		this.requestParam['types'] = FormattedTypes;

	this.Execute = function()
	{
		var AtomicID = this.atomicId;
		g_AsyncRequest[AtomicID] = this;

		if(!g_PlacesService)
			g_PlacesService = new google.maps.places.PlacesService(GetPlacesMap());

		function callback(results, status)
		{
			var RequestObj = g_AsyncRequest[AtomicID];
			if(RequestObj == undefined)
			{
				printf("timed out search callback. AtomicID[" + AtomicID + "]");
				return;
			}

			// Status
			if(RequestObj.cppContext && RequestObj.cancel == false)
			{
				RequestObj.cppContext.AddParam(status);
				RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;

				if (status == google.maps.places.PlacesServiceStatus.OK) 
				{
					var ResultCount = results.length;
					RequestObj.cppContext.AddParam(ResultCount);
					for(var i = 0;i < ResultCount;++i)
					{
						var result = results[i];
						MapPlacesResultBasicDataToSerializeData(result,RequestObj.cppContext);
					}
				}

				RequestObj.Finalize();
			}
			else
			{
				g_AsyncRequest[AtomicID] = null;
				delete g_AsyncRequest[AtomicID];
			}
		};

		// bug 59688 の workarownd のタイムアウト処理
		setTimeout(function(){
			var RequestObj = g_AsyncRequest[AtomicID];
			if(RequestObj != undefined)
			{
				RequestObj.cppContext.AddParam(google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR);
				RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;
				RequestObj.Finalize();
			}
		},SEARCH_TIMEOUT);

		if(this.requestParam.query != undefined)
			g_PlacesService.textSearch(this.requestParam, callback);// PlacesText検索を行う 
		else
			g_PlacesService.nearbySearch(this.requestParam, callback);// Places検索を行う 	
	}
}

function MapRequestPlacesDetails(nativeParam, cppContext)
{
	AsyncRequest.apply(this, [nativeParam, cppContext]);

	this.requestParam = {
		reference: nativeParam.Reference
	};
	
	this.Execute = function()
	{
		var RequestObj = this;
		g_AsyncRequest[this.atomicId] = RequestObj;
	
		// Places検索を行う
		if(!g_PlacesService)
			g_PlacesService = new google.maps.places.PlacesService(GetPlacesMap());

		g_PlacesService.getDetails(this.requestParam, function(result, status) 
		{
			if(RequestObj.cppContext && RequestObj.cancel == false)
			{
				// Status
				RequestObj.cppContext.AddParam(status);
				RequestObj.cppContext.retValue = MAP_RESULT_SUCCESS;

				if (status == google.maps.places.PlacesServiceStatus.OK) 
				{
					MapPlacesResultBasicDataToSerializeData(result,RequestObj.cppContext);
					RequestObj.cppContext.AddParam(result.formatted_address);
					RequestObj.cppContext.AddParam(result.formatted_phone_number);
					RequestObj.cppContext.AddParam(result.url);
					RequestObj.cppContext.AddParam(result.website);

					var attrcount = result.html_attributions.length;
					RequestObj.cppContext.AddParam(attrcount);
					for(var i = 0;i < attrcount;++i)
					{
						RequestObj.cppContext.AddParam(ParsePlacesHtmlAttribute(result.html_attributions[i]));
					}
				}

				RequestObj.Finalize();
			}
		});
	}
}	

function MapPlacesResultBasicDataToSerializeData(result, cppContextPlaces)
{
	cppContextPlaces.AddParam(result.name);
	cppContextPlaces.AddParam(result.geometry.location.lat());
	cppContextPlaces.AddParam(result.geometry.location.lng());
	if(result.geometry.viewport != undefined)
	{
		cppContextPlaces.AddParam(result.geometry.viewport.getNorthEast().lat());
		cppContextPlaces.AddParam(result.geometry.viewport.getNorthEast().lng());
		cppContextPlaces.AddParam(result.geometry.viewport.getSouthWest().lat());
		cppContextPlaces.AddParam(result.geometry.viewport.getSouthWest().lng());
	}
	else
	{
		cppContextPlaces.AddParam(undefined);
		cppContextPlaces.AddParam(undefined);
		cppContextPlaces.AddParam(undefined);
		cppContextPlaces.AddParam(undefined);
	}

	var typecount = 0;
	if(result.types != undefined)
		typecount = result.types.length;

	cppContextPlaces.AddParam(typecount);
	for(var i = 0;i < typecount;++i)
	{
		cppContextPlaces.AddParam(result.types[i]);
	}

	cppContextPlaces.AddParam(result.id);
	cppContextPlaces.AddParam(result.reference);
}

function ParsePlacesHtmlAttribute(inputHtml)
{
	var outputStr = "";
	var nInputDataSize = inputHtml.length;
	var nOutputCopiedIdx = -1;// outputStr へのコピー及び検討済みであることを示す inputHtmlのIndex
	var nGraeterIdx = -1;
	var nLessIdx = -1;
	var nClosingTagGraeterIdx = -1;
	var nClosingTagLessIdx = -1;
	
	// inputHtml について outputStr へのコピーの検討がすべてなされたら終了
	while(nOutputCopiedIdx < nInputDataSize - 1)
	{
		// タグが存在するか検索
		nGraeterIdx = inputHtml.indexOf(HTML_GREATER,nOutputCopiedIdx + 1);
		if(nGraeterIdx != -1)
		{
			// タグが存在した場合その直前までの文字列をoutputStrにコピー
			outputStr += inputHtml.substring(nOutputCopiedIdx + 1,nGraeterIdx);
			nOutputCopiedIdx = nGraeterIdx;

			nLessIdx = inputHtml.indexOf(HTML_LESS,nGraeterIdx + 1);
			var strAttr = inputHtml.substring(nGraeterIdx,nGraeterIdx + HTML_ANCHOR_HREF.length);

			if(strAttr == HTML_ANCHOR_HREF)
			{
				// タグが a href だった場合独自のフォーマットで outputStr にコピー
				var nClosingGraeterIdx = inputHtml.indexOf(HTML_GREATER,nLessIdx + 1);
				var nClosingLessIdx = inputHtml.indexOf(HTML_LESS,nClosingGraeterIdx + 1);
				var outArray = new Array();
				ParsePlacesHref(inputHtml.substring(nGraeterIdx,nClosingLessIdx + 1),outArray);
				var strName = outArray[0];
				var strLink = outArray[1];
				outputStr += strName + '(' + strLink + ')';
				nOutputCopiedIdx = nClosingLessIdx;
			}
			else
			{
				// a href 以外のタグの場合 outputStr へのコピーをスキップするため nOutputCopiedIdx のみ進める
				nOutputCopiedIdx = nLessIdx;
			}
		}
		else
		{
			// タグが存在しなかった場合残りの inputHtml をすべて outputStr にコピー
			outputStr += inputHtml.substring(nOutputCopiedIdx + 1,nInputDataSize - 1);
			nOutputCopiedIdx = nInputDataSize - 1;
		}
	}

	return outputStr;
}

function MapSetUnitWindSpeedType(nativeParam)
{
	g_windSpeedUnits = ConvertGoogleUnitWindSpeed(nativeParam.WindSpeed);

	if(g_weatherLayer)
	{
		var Options = 
		{
			windSpeedUnits:		g_windSpeedUnits
		};
		g_weatherLayer.setOptions(Options);
	}
}


function MapSetUnitTemperatureType(nativeParam)
{
	g_temperatureUnits	= ConvertGoogleUnitTemperature(nativeParam.Temperature);

	if(g_weatherLayer)
	{
		var Options = 
		{
			temperatureUnits:	g_temperatureUnits,
		};
		g_weatherLayer.setOptions(Options);
	}
}

function MapCancelRequest(nativeParam)
{
	var RequestObj = g_AsyncRequest[nativeParam.RequestId]

	if(RequestObj)
	{
		RequestObj.Cancel();
	}
}

function ParsePlacesHref(inputHrefData,outArray)
{
	var nLinkBeginIdx = inputHrefData.indexOf(HTML_QUOT) + 1;
	var nLinkEndIdx = inputHrefData.indexOf(HTML_QUOT,nLinkBeginIdx + 1) - 1;
	var nNameBeginIdx = inputHrefData.indexOf(HTML_LESS,nLinkEndIdx) + 1;
	var nNameEndIdx = inputHrefData.indexOf(HTML_GREATER,nNameBeginIdx + 1) - 1;
	outArray[0] = inputHrefData.substring(nNameBeginIdx,nNameEndIdx + 1);
	outArray[1] = inputHrefData.substring(nLinkBeginIdx,nLinkEndIdx + 1);
}

//--------------Other function------------------

function parseBool(value)
{
	var b = false;
	if(value && value != 0)
		b = true;
	return b;
}

//--------------Marker Manager function------------------

//マーカー本体と追加情報
function MarkerExtendInfo(markerId, markerType, markerObj) 
{
	this.Id		    = markerId;
	this.Type	    = markerType;
	this.Obj	    = markerObj;
	this.zOrgIndex  = 0;

	this.Show	= function(visible)
	{
		this.Obj.setVisible(visible);
	}

	this.Move	= function(latlng)
	{
		this.Obj.setPosition(latlng);
	}

	this.IsHit	= function(point)
	{	
		if(!this.Obj)
		{
			return false;
		}
		
		if(!this.Obj.getVisible())
		{
			return false;
		}
		
		var Icon	= this.Obj.getIcon();
		var latlng	= this.Obj.getPosition();
		var pos		= fromLatLngToPixel(latlng);
		var rect	= new Rect(pos.x - Icon.anchor.x, 
							   pos.y - Icon.anchor.y,
		                       pos.x - Icon.anchor.x + Icon.size.width,
		                       pos.y - Icon.anchor.y + Icon.size.height);

		return rect.PtInRect(point);
	}
	
	this.Detach = function()
	{
		this.Obj.setMap(null);
	}
	
	this.Reconstruction = function(newObj)
	{
		this.Obj = newObj;
	}
}

function CurrentPosIconInfo(accuracy, markerObj)
{
	MarkerExtendInfo.apply(this,[CURRENT_POS_ICON_ID, MarkerType_CurrentPos, markerObj]);
    this.AccCircle = new google.maps.Circle(); 

	var accopt =
	{
		center:markerObj.getPosition(), 
		fillColor:"#229FF2",
		fillOpacity:0.07,
		strokeColor:"#229FF2",
		strokeOpacity:0.7,
		radius:accuracy,
		clickable:false,
	};

	this.AccCircle.setOptions(accopt);
	if(markerObj.getVisible())
		this.AccCircle.setMap(markerObj.getMap());
	
	this.Show = function(visible)
	{
		this.Obj.setVisible(visible);
		if(visible)
		{
			if(this.AccCircle.getMap() != this.Obj.getMap())
				this.AccCircle.setMap(this.Obj.getMap());
		}
		else
		{
			this.AccCircle.setMap(null);
		}
	}

	this.Move	= function(latlng)
	{
		this.Obj.setPosition(latlng);
		this.AccCircle.setCenter(latlng);
	}

	this.UpdateAccuracy = function(accuracy)
	{
		this.AccCircle.setRadius(accuracy);
	}

	this.Detach = function()
	{
		this.Obj.setMap(null);
		this.AccCircle.setMap(null);
	}

	this.Reconstruction = function(newObj)
	{
		this.Obj = newObj;
		this.AccCircle.setMap(newObj.getMap());
	}
}

function Sleep(time)
{
	var d1 = new Date().getTime(); 
	var d2 = new Date().getTime(); 

	while( d2 < d1+time )
	{
		d2=new Date().getTime(); 
	} 
}

// 同じマーカーのタイプに属するマーカーのグループ。
// MarkerGroupManager内で使用することしか想定していない。
function MarkerGroup()
{
	this.MarkerHash = new Object();
	this.AddMarkerInfo = function(markerInfo)
	{
		this.MarkerHash[markerInfo.Id] = markerInfo;
	}

	this.GetMarkerInfo = function(markerId)
	{
		var marker = this.MarkerHash[markerId];
		if(marker != undefined)
		{
			return marker;
		}
		else
		{
			return null;
		}
	}

	this.RemoveMarker = function(markerId)
	{
		var info = this.MarkerHash[markerId];
		if(info != undefined)
		{
			info.Obj.setMap(null);
			delete this.MarkerHash[markerId];
		}
	}

	this.UpdateMarker = function(markerInfo)
	{
		this.MarkerHash[markerInfo.Id] = markerInfo;
	}

	this.MoveMarker = function(markerId,latlng)
	{
		var markerinfo = this.MarkerHash[markerId];
		markerinfo.Move(latlng);
	}
	
	this.RemoveAllMarkers = function()
	{
		for(var markerId in this.MarkerHash)
		{
			var marker = this.GetMarkerInfo(markerId);
			marker.Detach();
		}				
		
		delete this.MarkerHash;
		this.MarkerHash = new Object();
	}
	
	this.HasMarkerId = function(markerId)
	{
		var marker = this.MarkerHash[markerId];
		if(marker != undefined)
		{
			return true;
		}
		else
		{
			return false;
		}		
	}

	this.Show = function(bShow)
	{
		for(var markerId in this.MarkerHash)
		{
			this.ShowMarker(markerId,bShow);
		}				
	}
	
	this.ShowMarker = function(markerId,bShow)
	{
		var info = this.GetMarkerInfo(markerId);
		if(info)
			info.Show(bShow);
	}

	this.IsShowMarker = function(markerId)
	{
		var bShow = false;
		var marker = this.GetMarkerInfo(markerId);
		if(marker)
			bShow = marker.Obj.getVisible();
		return bShow;
	}

	this.GetHitMarker = function(point)
	{
		for(var markerId in this.MarkerHash)
		{
			var marker = this.GetMarkerInfo(markerId);

			if(marker)
			{
				if(marker.IsHit(point))
				{
					return marker;
				}
			}
		}
		
		return null;
	}
}

function NormalizeLatLng(latlng)
{
	var range = g_LatRange[g_map.getZoom()];
	
	if(!range)
	{
		return latlng;
	}
		
	if(latlng.lat() > range)
	{
		latlng = new google.maps.LatLng(range, latlng.lng());
	}

	if(latlng.lat() < -1 * range)
	{
		latlng = new google.maps.LatLng(-1 * range, latlng.lng()); 
	}
	
	return latlng;
}

function NotifyCenterChanged()
{
	if(g_fitBounds)
		return;

	if(g_InitializeTileLoadingStatus == InitializeTileLoading)
		g_InitializeTileLoadingStatus = InitializeTileLoadingWithOtherLoading;

	var latlang         = g_map.getCenter();
	var normalizelatlng = latlang;
	
	// 浮動小数点の比較で再帰から抜け出せない問題が出ないように
	// 正規化は一度だけ実行
	if(g_NormalizeLatLng == false)
	{
		normalizelatlng = NormalizeLatLng(latlang);
	}
	
	if(normalizelatlng != latlang)
	{
		g_NormalizeLatLng = true;
		g_map.setCenter(normalizelatlng);
		g_NormalizeLatLng = false;
		return;
	}

	var cppContext = new CppContextHelper();
	cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
	cppContext.eventType  = MapJSEventCenterChanged;
	cppContext.Lat = normalizelatlng.lat();
	cppContext.Lng = normalizelatlng.lng();
	
	var currentPos = GetCurrentCSSPos();

	if(currentPos)
	{
		cppContext.screenX = currentPos.x;
		cppContext.screenY = currentPos.y;
	}

	if(g_UseMapMoveGesture)
	{
		var matrixpos = GetMatrixPos();
		if(matrixpos)
			g_GestureMapMoveBasePos = matrixpos;
		g_GestureMapMovePos = {x:0,y:0};
	}
	
	cppContext.Serialize();
}

function NotifyZoomChanged()
{
	if(g_refresh_workaround || g_fitBounds)
		return;

	if(g_InitializeTileLoadingStatus == InitializeTileLoading)
		g_InitializeTileLoadingStatus = InitializeTileLoadingWithOtherLoading;

	var cppContext = new CppContextHelper();
	cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
	cppContext.eventType  = MapJSEventZoomLevelChanged;
	cppContext.zoom = g_map.getZoom();

	var currentPos = GetCurrentCSSPos();

	if(currentPos)
	{
		cppContext.screenX = currentPos.x;
		cppContext.screenY = currentPos.y;
	}

	cppContext.Serialize();
}

function NotifySelectMarkerEvent(markerId, latlng)
{
	var cppContext = new CppContextHelper();
	cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;

	if(markerId == CURRENT_POS_ICON_ID)
	{
		cppContext.eventType = MapJSEventSelectedCurrentPosIcon;
	}
	else
	{
		cppContext.eventType = MapJSEventSelectedMarker;
	}

	cppContext.Lat = latlng.lat();
	cppContext.Lng = latlng.lng();
	cppContext.markerId = markerId;
	cppContext.Serialize();
}

function IsZoomAnimation(oldZoom, newZoom)
{
	var zoom_diff = Math.abs(newZoom - oldZoom);

	if(zoom_diff >= Reconstruction_Zoom_Level || zoom_diff == 0)
	{
		return false;
	}
	
	return true;
}

function internal_set_Zoom_Center(zoom, center, force)
{
	if(WORKAROUND_DISABLE_ANIMATION == false)
	{
		if(center && g_map.getCenter() != center)
			g_map.setCenter(center);

		if(g_map.getZoom() != zoom)
			g_map.setZoom(zoom);
		
		return;
	}

	if(center == undefined)
		center = g_map.getCenter();

	if(!force)
	{
		var zoom_diff = Math.abs(g_map.getZoom() - zoom);
		if(zoom_diff >= Reconstruction_Zoom_Level || zoom_diff == 0)
		{
			g_map.setZoom(zoom);
			g_map.setCenter(center);
			return;
		}
	}
	
	Reconstruction(zoom, center);
}

function Reconstruction(zoom, center)
{
	var Options = 
	{
		zoom: 					zoom,
		minZoom:				MapZoomLevelMin,
		maxZoom:				MapZoomLevelMax,
		center: 				center,
		mapTypeId: 				g_map.getMapTypeId(),
		mapTypeControl: 		false,
		navigationControl: 		false,
		backgroundColor: 		MapBGColor,
		disableDoubleClickZoom: true,
		draggableCursor:		' ',
		draggingCursor:			' ',
		keyboardShortcuts:		false,
		scrollwheel:			false,
		streetViewControl:		false,
		scaleControl:			false,
		reportErrorControl: 	false,
        panControl:             false,
        rotateControl:			false,
        zoomControl:            false
	};

	g_map = new google.maps.Map(document.getElementById(MapView_ID), Options);

	g_markermanager.Reconstruction(g_map);

	if(g_trafficLayer && g_trafficLayer.getMap())
	{
		g_trafficLayer.setMap(g_map);
	}
	if(g_weatherLayer && g_weatherLayer.getMap())
	{
		g_weatherLayer.setMap(g_map);
	}
	
	if(g_cloudLayer && g_cloudLayer.getMap())
	{
		g_cloudLayer.setMap(g_map);
	}

	if(g_DirectionLine)
	{
		g_DirectionLine.setMap(g_map);
		
	}

	g_projectionHelper = new ProjectionHelper(g_map);

	RegistMapEvent();
	insertTileLayer();

	NotifyZoomChanged();
	NotifyCenterChanged();
}

function Rect(left, top, right, bottom)
{
	this.left    = left;
	this.top     = top;
	this.right   = right;
	this.bottom  = bottom;

	this.PtInRect = function(point)
	{
		if(this.left <= point.x    && 
		   point.x   <= this.right &&
		   this.top  <= point.y    &&
		   point.y   <= this.bottom)
		{
			return true;
		}
		
		return false;
	}
}

// MarkerGroup を使用してマーカーを種類ごとにまとめて管理するクラス。
// 基本的にマーカーの操作はこのクラスを使用して行う。
function MarkerGroupManager(map)
{
	this.Map = map;
	this.MarkerGroupHash = new Object();

	this.CreateIcon = function(MarkerType)
	{
		var Image = null;
		var Size = null;
		var ImageSize = null;
		var Anchor = null;
		

		if(g_ImageData[MarkerType].Width != null && g_ImageData[MarkerType].Height != null)
			Size = new google.maps.Size(g_ImageData[MarkerType].Width, g_ImageData[MarkerType].Height);

		if(g_ImageData[MarkerType].ImageWidth  != null && g_ImageData[MarkerType].ImageHeight != null)
			ImageSize = new google.maps.Size(g_ImageData[MarkerType].ImageWidth, g_ImageData[MarkerType].ImageHeight);

		if(g_ImageData[MarkerType].Anchor_X != null && g_ImageData[MarkerType].Anchor_Y != null)
			Anchor = new google.maps.Point(g_ImageData[MarkerType].Anchor_X, g_ImageData[MarkerType].Anchor_Y);

		Image = new google.maps.MarkerImage(g_ImageData[MarkerType].Path, Size, null, Anchor, ImageSize);

		return Image;
	}

	this.CreateMarkerObject = function(MarkerType,Latlng,Visible)
	{
		var MarkerObj = null;
		var Image = this.CreateIcon(MarkerType);
		var Shadow = null;
		var Flat = true;
		
		if(MarkerType == MarkerType_SearchResult ||
		   MarkerType == MarkerType_UserFlag)
		{
			Flat = false;
			Shadow = this.CreateIcon(MarkerType_Shadow);
		}
		else if(MarkerType == MarkerType_Bookmark)
		{
			Flat = false;
			Shadow = this.CreateIcon(MarkerType_Bookmark_Shadow);
		}
		else if(MarkerType == MarkerType_Dir_Start ||
				MarkerType == MarkerType_Dir_End)
		{
			Flat = false;
			Shadow = this.CreateIcon(MarkerType_Shadow_Square);
		}

		var marker_z_index = 0;

		switch(MarkerType)
		{
			case MarkerType_SelectCircle:
				marker_z_index = ZIndex_SelectCircle;
				break;
			
			case MarkerType_CurrentPos:
				marker_z_index = ZIndex_CurrentPos;
				break;
			
			case MarkerType_Dir_Step:
				marker_z_index = ZIndex_Direction_Step;
				break;
		}
		
		MarkerObj = new google.maps.Marker(
		{
			position: Latlng,
			map: this.Map,
			icon: Image,
			clickable: false,
			visible: Visible,
			zIndex: marker_z_index,
			flat: Flat,
			shadow: Shadow
		});
		
		return MarkerObj;
	}

	this.CreateMarkerInfo = function(MarkerId,MarkerType,Latlng,Visible)
	{
		var MarkerObj = this.CreateMarkerObject(MarkerType,Latlng,Visible);
		var MarkerInfo = new MarkerExtendInfo(MarkerId,MarkerType,MarkerObj);
		return MarkerInfo;
	}

	this.RemoveMarker = function(markerId)
	{
		if(this.SelectId == markerId)
		{
			this.SelectMarker(null);
		}
		
		var group = this.GetMarkerGroupFromId(markerId);
		if(group)
		{
			group.RemoveMarker(markerId);
		}
	}

	this.GetMarkerInfo = function(markerId)
	{
		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.MarkerGroupHash[markerType];
			if(group != undefined)
			{
				var marker = group.MarkerHash[markerId];
				if(marker != undefined)
				{
					return marker;
				}
			}
		}
		return null;
	}

	this.AddMarkerInfo = function(markerInfo)
	{
		var existinfo = this.GetMarkerInfo(markerInfo.Id);
		if(existinfo)
			this.RemoveMarker(markerInfo.Id);
	
		var group = this.MarkerGroupHash[markerInfo.Type];
		if(group == undefined)
		{
			group = new MarkerGroup();
			this.MarkerGroupHash[markerInfo.Type] = group;
		}
		group.AddMarkerInfo(markerInfo);
	}

	// 選択サークルの生成
	this.CreateSelectCircle = function()
	{
		var CirclePoint = new google.maps.LatLng(0.0, 0.0);
		this.SelectCircle = this.CreateMarkerObject(MarkerType_SelectCircle,CirclePoint,false);
	}
	
	this.CreateSelectCircle();

	// 現在位置アイコンの生成
	this.CreateCurrentPosIcon = function()
	{
		var LatLng = new google.maps.LatLng(0.0, 0.0);
		var MarkerObj = this.CreateMarkerObject(MarkerType_CurrentPos,LatLng,false);
		var MarkerInfo = new CurrentPosIconInfo(0,MarkerObj);
		this.AddMarkerInfo(MarkerInfo);
	}

	this.AddMarkerData = function(MarkerId,MarkerType,Position,Visible)
	{
		var MarkerInfo = this.CreateMarkerInfo(MarkerId,MarkerType,Position,Visible);
		this.AddMarkerInfo(MarkerInfo);
	}

	this.UpdateSelectMarkerZIndex = function(oldSelectId, newSelectId)
    {
        if(oldSelectId)
        {
            // オリジナルのzIndexに戻す
    		var info = this.GetMarkerInfo(oldSelectId);
	
			if(info && info.Obj)
				info.Obj.setZIndex(info.zOrgIndex);
        }
        
        if(newSelectId)
        {
            // 選択用に前面表示にする
    		var info = this.GetMarkerInfo(newSelectId);
			
			if(info && info.Obj)
				info.Obj.setZIndex(ZIndex_SelectObject);
        }
    }

	this.Reconstruction = function(map)
	{
		this.Map = map;

		var Markers = this.GetAllMarkers();
		var len = Markers.length;
		
		for(var i = 0; i < len; i++)
		{
			var markerInfo = Markers[i];
			var markerObj  = markerInfo.Obj;

			if(markerObj)
			{
				var newMarkerObj = this.CreateMarkerObject(markerInfo.Type, markerObj.getPosition(), markerObj.getVisible());
				markerInfo.Reconstruction(newMarkerObj);
			}
		}
		
		this.SelectCircle.setMap(map);
	}

	this.UpdateMarkerZIndex = function()
	{
		var Markers       = this.GetAllMarkers();
		var TargetMarkers = new Array();
		var len = Markers.length;
		
		for(var i = 0; i < len; i++)
		{
			var marker    = Markers[i];
			var markerObj = marker.Obj;

			if(markerObj)
			{
				if(Markers[i].Type == MarkerType_CurrentPos)
				{
					marker.zOrgIndex = ZIndex_CurrentPos;
    				markerObj.setZIndex(marker.zOrgIndex);
				}
				else if(Markers[i].Type == MarkerType_Dir_Step)
				{
					marker.zOrgIndex = ZIndex_Direction_Step;
    				markerObj.setZIndex(marker.zOrgIndex);
				}
				else
				{
    				marker.zOrgIndex = ZIndex_Marker;
    				markerObj.setZIndex(marker.zOrgIndex);
   					TargetMarkers.push(marker);
				}
			}
		}

        function zIndexComp(marker1, marker2)
        {
			var latlng1 = marker1.Obj.getPosition();
			var latlng2 = marker2.Obj.getPosition();

			return (latlng2.lat() - latlng1.lat());
        }
        
        function set_zIndex(ary, cmp)
        {
			if(ary.length == 0)
			{
				return ary;
			}

			function q(ary, head, tail)
			{
				var pivot = ary[parseInt(head + (tail - head) / 2)];
				var i = head - 1;
				var j = tail + 1;

				while(1)
				{
					while (cmp(ary[++i], pivot) < 0);
					while (cmp(ary[--j], pivot) > 0);

					if(i >= j)
						break;

					var tmp = ary[i];
					ary[i] = ary[j];
					ary[j] = tmp;

					ary[i].zOrgIndex = ZIndex_Marker + i;
					ary[i].Obj.setZIndex(ary[i].zOrgIndex);

					ary[j].zOrgIndex = ZIndex_Marker + j;
					ary[j].Obj.setZIndex(ary[j].zOrgIndex);
				}

				if(head < i - 1)
				{
					q(ary, head, i - 1);
				}

				if(j + 1 < tail)
				{
					q(ary, j + 1, tail);
				}
				return ary;
			}

			return q(ary, 0, ary.length - 1);
        }

		set_zIndex(TargetMarkers, zIndexComp);

		// 選択に関するzIndexを追加
		this.UpdateSelectMarkerZIndex(null, this.SelectId);

        // Debug
		// this.OutputMarkerZIndex(Markers);
		// this.OutputMarkerZIndex(TargetMarkers);
	}

	this.OutputMarkerZIndex = function(Markers)
	{
		for(var i = 0; i < Markers.length; i++)
		{
			var markerObj = Markers[i].Obj;

			if(markerObj)
			{
				var type = "";
				
				switch(Markers[i].Type)
				{
					case MarkerType_Bookmark_Shadow:
						type = "MarkerType_Bookmark_Shadow";
						break;
					case MarkerType_Shadow_Square:
						type = "MarkerType_Shadow_Square"
						break;
					case MarkerType_Shadow:
						type = "MarkerType_Shadow";
						break;
					case MarkerType_SelectCircle:
						type = "MarkerType_SelectCircle";
						break;
					case MarkerType_CurrentPos:
						type = "MarkerType_CurrentPos";
						break;
					case MarkerType_Bookmark:
						type = "MarkerType_Bookmark";
						break;
					case MarkerType_SearchResult:
						type = "MarkerType_SearchResult";
						break;
					case MarkerType_UserFlag:
						type = "MarkerType_UserFlag";
						break;
					case MarkerType_Dir_Step:
						type = "MarkerType_Dir_Step";
						break;
					case MarkerType_Dir_Start:
						type = "MarkerType_Dir_Start";
						break;
					case MarkerType_Dir_End:
						type = "MarkerType_Dir_End";
						break;
				}

				printf("type = " +  type + " zindex = " + markerObj.getZIndex());
			}
		}
	}

	this.AddMarkers = function(markerInfolist)
	{
		for(var i = 0;i < markerInfolist.length;++i)
		{
			var markerInfo = markerInfolist[i];
			this.AddMarkerInfo(markerInfo);
		}
	}

	this.UpdateMarker = function(markerInfo)
	{
		var group = this.MarkerGroupHash[markerInfo.Type];
		if(group != undefined)
		{
			group.UpdateMarker(markerInfo);
		}
	}

	this.MoveMarker = function(markerId,latlng)
	{
		var bSelectMarker = false;
		if(this.SelectId == markerId)
		{
			this.SelectMarker(null);
			bSelectMarker = true;
		}
	
		var group = this.GetMarkerGroupFromId(markerId);
		if(group != undefined)
		{
			group.MoveMarker(markerId,latlng);
		}
		
		if(bSelectMarker)
		{
			this.SelectMarker(markerId);
		}
	}

	this.HasMarkerId = function(markerId)
	{
		var info = this.GetMarkerInfo(markerId);
		if(info)
			return true;
		else
			return false;
	}

	this.GetMarkerGroup = function(markerType)
	{
		var group = this.MarkerGroupHash[markerType];
		if(group != undefined)
		{
			return group;
		}
		else
		{
			return null;
		}
	}

	this.GetMarkerGroupFromId = function(markerId)
	{
		var group = null;
		var info = this.GetMarkerInfo(markerId);
		if(info)
			group = this.GetMarkerGroup(info.Type);
		return group;	
	}

	this.GetMarkerInfoFromObj = function(markerObj)
	{
		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.GetMarkerGroup(markerType);
			if(!group)
				continue;

			for(var markerId in group.MarkerHash)
			{
				var marker = group.GetMarkerInfo(markerId);
				if(marker && marker.Obj == markerObj)
				{
					return marker;
				}
			}
		}
		return null;
	}

	this.GetAllMarkers = function()
	{
		var Markers = new Array();

		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.GetMarkerGroup(markerType);

			if(!group)
				continue;

			for(var markerId in group.MarkerHash)
			{
				var marker = group.GetMarkerInfo(markerId);

				if(marker)
				{
					Markers.push(marker);
				}
			}
		}
		
		return Markers;
	}

	this.GetMarkerGroups = function()
	{
		var groups = new Array();
		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.MarkerGroupHash[markerType];
			groups.push(group);
		}
		return groups;
	}
	
	this.ShowMarkerGroup = function(markerType,bShow)
	{
		var group = this.GetMarkerGroup(markerType);
		if(group)
		{
			if(!bShow && group.HasMarkerId(this.SelectId))
			{
				this.SelectMarker(null);
			}
			group.Show(bShow);
		}
	}

	this.ShowMarker = function(markerId,bShow)
	{
		if(!bShow && this.SelectId == markerId)
		{
			this.SelectMarker(null);
		}

		var group = this.GetMarkerGroupFromId(markerId);
		if(group)
			group.ShowMarker(markerId,bShow);
	}

	this.UpdateCurPosAccuracy = function(accuracy, latlng)
	{
		var info = this.GetMarkerInfo(CURRENT_POS_ICON_ID);
		if(info && info.UpdateAccuracy)
		{
			info.Move(latlng);
			info.UpdateAccuracy(accuracy);
		}
	}

	this.IsShowMarker = function(markerId)
	{
		var bShow = false;
		var group = this.GetMarkerGroupFromId(markerId);
		if(group)
			bShow = group.IsShowMarker(markerId);
		
		return bShow;
	}

	this.SelectMarker = function(markerId)
	{
		if(this.SelectId == markerId)
		{
			return;
		}

        var oldSelectId = this.SelectId;
		this.SelectId = markerId;
		this.SelectCircle.setVisible(false);

		var marker = this.GetMarkerInfo(markerId);
		if(marker)
		{
			this.SelectCircle.setZIndex(ZIndex_SelectCircle);
			this.SelectCircle.setPosition(marker.Obj.getPosition());
			
			if(marker.Obj.getVisible())
    		{
    			this.SelectCircle.setVisible(true);
			}
		}
		
		this.UpdateSelectMarkerZIndex(oldSelectId, markerId);
	}

	this.RemoveMarkerGroup = function(markerType)
	{
		var group = this.GetMarkerGroup(markerType);
		if(!group)
			return;

		if(group.HasMarkerId(this.SelectId))
		{
			this.SelectMarker(null);
		}
		
		group.RemoveAllMarkers();
	}

	this.RemoveAllMarkers = function()
	{
		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.MarkerGroupHash[markerType];
			group.RemoveAllMarkers();
		}
	}
	
	this.GetHitMarker = function(point)
	{
		for(var markerType in this.MarkerGroupHash)
		{
			var group = this.GetMarkerGroup(markerType);

			if(!group)
				continue;

			var marker = group.GetHitMarker(point);

			if(marker)
			{
				return marker;
			}
		}

		return null;
	}
}
