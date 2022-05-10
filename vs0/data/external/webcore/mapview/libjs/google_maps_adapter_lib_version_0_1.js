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
// ZoomLevel

const MapZoomLevelMin = 2;
const MapZoomLevelMax = 21;
const MapZoomLevelFitBoundsMax = 17;

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

// MapLayerType(Shift bit)
const MapLayerType_ShiftBit_Traffic = 0;

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
//g_ImageData[MarkerType_CurrentPos]		= new ImageData('./image/navigation/Map_location_circle.png', CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER / 2, CUR_POS_DIAMETER / 2);
g_ImageData[MarkerType_CurrentPos]		= new ImageData('./image/flags/Dummy.png', CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER, CUR_POS_DIAMETER / 2, CUR_POS_DIAMETER / 2);
g_ImageData[MarkerType_SelectCircle]	= new ImageData('./image/flags/Select_Circle_Red_circle.png',SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER, SELECT_CIRCLE_DIAMETER / 2, SELECT_CIRCLE_DIAMETER / 2);
g_ImageData[MarkerType_Dir_Step]		= new ImageData('./image/direction/Map_corn_circle.png', DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER, DIR_STEP_DIAMETER / 2, DIR_STEP_DIAMETER / 2);
g_ImageData[MarkerType_Dir_Start]		= new ImageData('./image/flags/Map_Flag_start.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_Dir_End]			= new ImageData('./image/flags/Map_Flag_goal.png', FLAG_WIDTH, FLAG_HEIGHT + CUR_POS_DIAMETER / 2, FLAG_WIDTH, FLAG_HEIGHT, FLAG_WIDTH / 2, FLAG_HEIGHT);
g_ImageData[MarkerType_Shadow]			= new ImageData('./image/flags/Map_Flag_shadow.png', null, null, null, null);
g_ImageData[MarkerType_Shadow_Square]	= new ImageData('./image/flags/Map_Flag_shadow_square.png', null, null, null, null);
g_ImageData[MarkerType_Bookmark_Shadow]	= new ImageData('./image/bookmark/Map_Bookmark_shadow.png', null, null, null, null);

//////////////////////////////////////////////////
// 
// 旗が画面にはおさまるレンジ
// 
// 512<画面全体の高さ> - 68<旗の高さ> * 2 = 376ピクセル
// に対する各ズームの緯度の範囲 

var g_FitBoundsRange = new Object();

g_FitBoundsRange[0]  = 81.81793;
g_FitBoundsRange[1]  = 81.81793;
g_FitBoundsRange[2]  = 81.81793;
g_FitBoundsRange[3]  = 46.804926;
g_FitBoundsRange[4]  = 25.12928;
g_FitBoundsRange[5]  = 13.00564;
g_FitBoundsRange[6]  = 6.610664;
g_FitBoundsRange[7]  = 3.331704;
g_FitBoundsRange[8]  = 1.672352;
g_FitBoundsRange[9]  = 0.837792;
g_FitBoundsRange[10] = 0.419304;
g_FitBoundsRange[11] = 0.209751;
g_FitBoundsRange[12] = 0.104897;
g_FitBoundsRange[13] = 0.052441;
g_FitBoundsRange[14] = 0.026238;
g_FitBoundsRange[15] = 0.013118;
g_FitBoundsRange[16] = 0.006539;
g_FitBoundsRange[17] = 0.003273;
g_FitBoundsRange[18] = 0.00164;
g_FitBoundsRange[19] = 0.000832;
g_FitBoundsRange[20] = 0.0004;
g_FitBoundsRange[21] = 0.00021;


//////////////////////////////////////////////////
// 
// 旗が画面にはおさまるレンジ（Toolバーの高さも含まれる）
//
// 512<画面全体の高さ> - ( 64<Toolバーの高さ> + 68<旗の高さ> ) * 2 = 248ピクセル
// に対する各ズームの緯度の範囲 

var g_FitBoundsRangeInToolBar = new Object();

g_FitBoundsRangeInToolBar[0]  = 39.927791;
g_FitBoundsRangeInToolBar[1]  = 39.927791;
g_FitBoundsRangeInToolBar[2]  = 39.927791;
g_FitBoundsRangeInToolBar[3]  = 26.875828;
g_FitBoundsRangeInToolBar[4]  = 15.547363;
g_FitBoundsRangeInToolBar[5]  = 8.321499;
g_FitBoundsRangeInToolBar[6]  = 4.296356;
g_FitBoundsRangeInToolBar[7]  = 2.181595;
g_FitBoundsRangeInToolBar[8]  = 1.099071;
g_FitBoundsRangeInToolBar[9]  = 0.55159;
g_FitBoundsRangeInToolBar[10] = 0.27631;
g_FitBoundsRangeInToolBar[11] = 0.138298;
g_FitBoundsRangeInToolBar[12] = 0.069176;
g_FitBoundsRangeInToolBar[13] = 0.0346;
g_FitBoundsRangeInToolBar[14] = 0.017296;
g_FitBoundsRangeInToolBar[15] = 0.008663;
g_FitBoundsRangeInToolBar[16] = 0.004318;
g_FitBoundsRangeInToolBar[17] = 0.002151;
g_FitBoundsRangeInToolBar[18] = 0.001079;
g_FitBoundsRangeInToolBar[19] = 0.000545;
g_FitBoundsRangeInToolBar[20] = 0.000267;
g_FitBoundsRangeInToolBar[21] = 0.000138;

//////////////////////////////////////////////////
// Variable

var	g_projectionHelper	= null;
var	g_map 				= null;
var	g_httpRequest		= null;
var	g_markermanager		= null;
var g_mapMode			= true;
var g_trafficLayer      = null;

var g_tilesLoaded		= 0;
var g_TileDirty 		= false;
var g_searched			= false;
var g_fitBounds			= false;
var g_refresh_workaround	= false;
var g_AtomicId			= -1;

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
        g_map.setZoom(level);
    }
    else
    {
        // Zoom with Center(Css).
	    var zoom_center_latlng  = fromPixelToLatLng(zoom_center_old_pix);

	    g_map.setZoom(level);

	    var map_center_latlng   	 = g_map.getCenter();
	    var map_center_pix      	 = fromLatLngToPixel(map_center_latlng);
	    var zoom_center_temp_pix     = fromLatLngToPixel(zoom_center_latlng);
	    var move_offset_pix   	 = new google.maps.Point(zoom_center_new_pix.x - zoom_center_old_pix.x, zoom_center_new_pix.y - zoom_center_old_pix.y);
	    var zoom_center_offset_pix   = new google.maps.Point(zoom_center_temp_pix.x - zoom_center_old_pix.x, zoom_center_temp_pix.y - zoom_center_old_pix.y);
	    var center_new_pix      	 = new google.maps.Point(map_center_pix.x + zoom_center_offset_pix.x - move_offset_pix.x, map_center_pix.y + zoom_center_offset_pix.y- move_offset_pix.y);

	    var center_new_latlng   	 = fromPixelToLatLng(center_new_pix);
        center_new_latlng = NormalizeLatLng(center_new_latlng);
	    g_map.setCenter(center_new_latlng);
	    delete move_offset_pix;
	    delete zoom_center_offset_pix;
	    delete center_new_pix;
	}
}

// ズーム変更（ズームの中心をCSSの座標で指定）

function ChangeZoom_Center_CSS(level, zoom_center_new_pix)
{
    var center_new_latlng  = fromPixelToLatLng(zoom_center_new_pix);

    if(level != g_map.getZoom())
    {
        g_map.setZoom(level);
    }

    center_new_latlng = NormalizeLatLng(center_new_latlng);
    g_map.setCenter(center_new_latlng);
}

//////////////////////////////////////////////////////// 

function googleMapAdapterTable(functionId, atomicId, jsonParamListObj)
{
	jsonParamListObj.Error = MAP_RESULT_SUCCESS;
	
	var cppContext = new CppContextHelper();
	cppContext.eventType = MapJSEventFunctionFinished;
	cppContext.Error = jsonParamListObj.Error;
	cppContext.functionId = functionId;
	cppContext.atomicId = atomicId;
	
	switch (functionId)
	{
		case MAP_JSCALL_INITIALIZE_ID: 
		{
			Initialize(jsonParamListObj, 'mapview', cppContext);
			break;
		}
		case MAP_JSCALL_SETZOOM_ID:
		{
			MapSetZoom(jsonParamListObj, cppContext);
			break;
		}
		case MAP_JSCALL_SETZOOM_CENTER_ID:
		{
			MapSetZoomCenter(jsonParamListObj, cppContext);
			break;
		}
		case MAP_JSCALL_SET_MAP_TYPE_ID:
		{
			MapSetType(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_SETCENTER_ID:
		{
			MapSetCenter(jsonParamListObj);             
			break;
		}
		case MAP_JSCALL_SETCENTER_PIXEL_ID:
		{
			MapSetCenterWithPixel(jsonParamListObj);             
			break;
		}
		case MAP_JSCALL_MOVETO_MARKER_ID:
		{
			MapMoveToMarker(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_UPDATE_MARKER_ID:
		{
			UpdateMarker(jsonParamListObj, cppContext);
			break;
		}
		case MAP_JSCALL_UPDATE_CURRENT_POSITION_ICON_ID:
		{
			MapUpdateCurrentPositionIcon(jsonParamListObj, cppContext);
			break;
		}
		case MAP_JSCALL_ADD_MARKER_LIST_ID:
		{
			MapAddMarkerList(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_REMOVE_MARKERS_ID:
		{
			MapRemoveMarkers(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_REMOVE_ALL_MARKER_ID:
		{
			MapRemoveMarkerGroup(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_SHOW_ALL_MARKER_ID:
		{
			MapShowMarkerGroup(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_SELECT_MARKER_ID:
		{
			MapSelectMarker(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_SELECT_CURRENT_POSITION_ICON_ID:
		{
			MapSelectCurrentPositionIcon(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_UNSELECT_ID:
		{
			MapUnselect(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_SET_DIRECTION_DATA_ID:
		{
			MapSetDirectionData(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_CLEAR_DIRECTION_DATA_ID:
		{
			MapClearDirectionData();
			break;
		}
		case MAP_JSCALL_SHOW_URL_VIEW_ID:
		{
			MapShowUrl(jsonParamListObj);             
			break;
		}
		case MAP_JSCALL_MODIFY_LAYER_ID:
		{
		    MapModifyLayer(jsonParamListObj);
			break;
		}
		case MAP_JSCALL_FIT_BOUNDS_ID:
		{
		    MapFitBounds(jsonParamListObj);
		    break;
		}
		case MAP_JSCALL_REFRESH_TILES_ID:
		{
		    MapRefreshTiles(jsonParamListObj);
		    break;
		}
		case MAP_JSCALL_MOVETO_CURRENT_POSITION_ICON_ID:
		{
			MapMoveToCurrentPositionIcon(jsonParamListObj);
			break;
		}
		
	}
	cppContext.retValue  = jsonParamListObj.Error;
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

///////////////////////////////////////////////////////

function OnSingleTileLoaded()
{
}



function OnMapMouseDown(event)
{
}

function OnMapMouseUp(event)
{
}

function RegistMapEvent()
{
	// MouseEvent
	window.addEventListener("mousedown", OnMapMouseDown, true);
	window.addEventListener("mouseup", OnMapMouseUp, true);

    google.maps.event.addListener(g_map, 'tilesloaded', function() 
    {
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
		if (!g_refresh_workaround && !g_fitBounds)
		{
			NotifyZoomChanged();
		}
	});   


    google.maps.event.addListener(g_map, 'center_changed', function() 
    {
		if (!g_fitBounds)
		{
			NotifyCenterChanged();
		}
    });   

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

    google.maps.event.addListener(g_map, 'dragstart', function() 
    {
		var cppContext = new CppContextHelper();
 		cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
		cppContext.eventType  = MapJSEventMapDragBegin;
		cppContext.Serialize();
	});   

    google.maps.event.addListener(g_map, 'dragend', function() 
    {
		var cppContext = new CppContextHelper();
 		cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
		cppContext.eventType  = MapJSEventMapDragEnd;
		cppContext.Serialize();
	});   
}


///////////////////////////////////////////////////////
// API Function
///////////////////////////////////////////////////////
// Initialize

function Initialize(nativeParam, mapViewId, cppContext)
{
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
		backgroundColor: 		0x579500,
		disableDoubleClickZoom: true,
		draggableCursor:		' ',
		draggingCursor:			' ',
		keyboardShortcuts:		false,
		scrollwheel:			false,
		streetViewControl:		false,
		scaleControl:			false,
	};

	g_map = new google.maps.Map(document.getElementById(mapViewId), Options);
	g_projectionHelper = new ProjectionHelper(g_map);
	g_markermanager = new MarkerGroupManager(g_map);
	g_trafficLayer = new google.maps.TrafficLayer();

	// 地図のイベントを登録
	RegistMapEvent();

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

	if(select_id != null)
	{
		g_markermanager.SelectMarker(select_id);
	}

	// 交通情報	
    // Traffic Layer
    var traffic = (nativeParam.LayerType & MapLayerType_Traffic) >> MapLayerType_ShiftBit_Traffic;

	if(traffic)
	{
		g_trafficLayer.setMap(g_map);
	}
	
	// urlmodeの場合MapModeに戻す
	if(!g_mapMode)
	{
		var param = new Object();
		param['Visible'] = false;
		MapShowUrl(param);
	}

	// Zoom値・中心位置を設定する	
	var latlang = g_map.getCenter();
	cppContext.Lat = latlang.lat();
	cppContext.Lng = latlang.lng();
	cppContext.zoom = g_map.getZoom();
	

	var tileLayer = new google.maps.ImageMapType({
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
//	   node.firstChild.onload = OnSingleTileLoaded;
	   g_TileDirty = false;
           return node;
         };

	g_map.overlayMapTypes.insertAt(0, tileLayer);
	
}

///////////////////////////////////////////////////////
// SetZoom

function MapSetZoom(nativeParam, cppContext)
{
	var paramZoomVal   = nativeParam.ZoomLevel;
    g_map.setZoom(paramZoomVal);
	cppContext.zoom = g_map.getZoom();
	nativeParam.Error = 0;
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
	nativeParam.Error = 0;
	delete center_new_css;
}

///////////////////////////////////////////////////////
// SetType

function MapSetType(nativeParam)
{
	g_map.setMapTypeId(ConvertGoogleMapType(nativeParam.MapType));
	nativeParam.Error = 0;
}

///////////////////////////////////////////////////////
// SetCenter

function MapSetCenter(nativeParam)
{
	var lat = nativeParam.Center.Lat;
	var lng = nativeParam.Center.Lng;
	var latlng = new google.maps.LatLng(lat, lng);
	g_map.setCenter(latlng);
	nativeParam.Error = 0;
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

function MapRefreshTiles(nativeParam)
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
    //			if (newZoomlevel != prevZoom)
    //			{
				    g_map.setZoom(prevZoom);
    //				g_map.setZoom(newZoomlevel - zoomset);
    //			}
			    g_refresh_workaround = false;
		    }
		    , 300);
    }
		
	nativeParam.Error = 0;
}



///////////////////////////////////////////////////////
// ShowUrl

function MapShowUrl(nativeParam) 
{
	if(parseBool(nativeParam.Visible) == true)
	{
		document.getElementById('mapview').style.display   = 'none';
		document.getElementById('htmlview').style.display  = 'block';

		if(g_httpRequest == null)
		{
		    g_httpRequest = new XMLHttpRequest();
		}

		var url = nativeParam.Url;

		g_httpRequest.open('GET', url, true); 
		g_httpRequest.onreadystatechange = function()
		{
			if(g_httpRequest.readyState == 4 && g_httpRequest.status == 200)
			{
				document.getElementById('htmlview').innerHTML = g_httpRequest.responseText;
			}
		}

		g_httpRequest.send(null);
		g_mapMode = false;
	}
	else
	{
		if(g_httpRequest)
		{
			g_httpRequest.abort();
		}

	    document.getElementById('mapview').style.display   = 'block';
	    document.getElementById('htmlview').style.display  = 'none';
	    document.getElementById('htmlview').innerHTML      = ''
	    google.maps.event.trigger(g_map, 'resize');
		g_mapMode = true;
	}
}

///////////////////////////////////////////////////////
// ModifyLayer

function MapModifyLayer(nativeParam)
{
    var addLayer    = nativeParam.AddLayer;
    var removeLayer = nativeParam.RemoveLayer;
    
    // Currently only traffic layer is supported.
    var addFlag = 0;
    var delFlag = 0;
    
    // Traffic Layer
    addFlag = (addLayer & MapLayerType_Traffic) >> MapLayerType_ShiftBit_Traffic;
    if(addFlag) {
        if(!g_trafficLayer) {
            g_trafficLayer = new google.maps.TrafficLayer();
            if(!g_trafficLayer) {
                return;
            }
        }
        g_trafficLayer.setMap(g_map);
    }
    delFlag = (removeLayer & MapLayerType_Traffic) >> MapLayerType_ShiftBit_Traffic;
    if(delFlag) {
        if(g_trafficLayer) {
            g_trafficLayer.setMap(null);
        } else {
            // Nothing to do.
        }
    }
}

///////////////////////////////////////////////////////
// FitBounds

function MapFitBounds(nativeParam)
{
	var BoundsRect 		= null;
	var FitCenterLatLng = null;

	for( var i = 0; i < nativeParam.PosList.length; i++) 
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
		FitBounds(BoundsRect, false);
	}
	else if(FitCenterLatLng)
	{
		FitCenter(FitCenterLatLng);
	}
}

function FitBounds(BoundsRect, adjustInToolBar)
{
	if(BoundsRect.isEmpty())
		return;

	g_fitBounds = true;
	g_map.fitBounds(BoundsRect);

	var latlng_ne = BoundsRect.getNorthEast();
	var latlng_sw = BoundsRect.getSouthWest();

	var range = latlng_ne.lat() - latlng_sw.lat();
	var zoom  = g_map.getZoom();

	var RangeInfo = g_FitBoundsRange;
	
	if(adjustInToolBar)
	{
		RangeInfo = g_FitBoundsRangeInToolBar;
	}
	
	if(RangeInfo[zoom] != undefined)
	{
		if(MapZoomLevelMin < zoom && RangeInfo[zoom] <= range)
		{
			g_map.setZoom(zoom - 1);
		}
	}

	g_fitBounds = false;
	NotifyCenterChanged()
	NotifyZoomChanged();
}	

function FitCenter(latlng)
{
	g_map.setCenter(latlng);
	g_map.setZoom(MapZoomLevelFitBoundsMax);
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
			
			if(latlng)
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
		jsonParamListObj.Error = MAP_RESULT_GENERIC_ERROR;
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
		    g_map.setZoom(zoomLevel);
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
		    g_map.setZoom(zoomLevel);
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
	
	if(nativeParam.FitBoundsList)
	{
		var BoundsRect 		= null;
		var FitCenterLatLng = null;

		for( var i = 0; i < nativeParam.FitBoundsList.length; i++ )
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
			FitBounds(BoundsRect, false);
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


//--------------Direction------------------

var DirectionLine = null;

function MapSetDirectionData(nativeParam)
{
	g_searched = true;
	MapClearDirectionData();

	var DecodedData = DirectionDataDecode(nativeParam.PolylineList);
    DirectionLine = new google.maps.Polyline({
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
			FitBounds(BoundsRect, true);
		}
		else if(FitCenterLatLng)
		{
			FitCenter(FitCenterLatLng);
		}
	}
}

function MapClearDirectionData()
{
	if(DirectionLine)
	{
		DirectionLine.setMap(null);
		delete DirectionLine;
		DirectionLine = null;		
	}
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_Step);
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_Start);
	g_markermanager.RemoveMarkerGroup(MarkerType_Dir_End);
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

//--------------Other function------------------

function parseBool(value)
{
	var b = true;
	if(value == 0)
		b = false;
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
}

function CurrentPosIconInfo(accuracy, markerObj)
{
	MarkerExtendInfo.apply(this,[CURRENT_POS_ICON_ID,MarkerType_CurrentPos,markerObj]);
    this.AccCircle = new google.maps.Circle(); 

	var accopt =
	{
		center:markerObj.getPosition(), 
		strokeColor:"#5AC800",
		fillColor:"#B4FF00",
		fillOpacity:0.2,
		strokeOpacity:0.5,
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
			this.AccCircle.setMap(null);
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
			marker.Obj.setMap(null);
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
	if (latlng.lat() > 65.0)
	{
		latlng = new google.maps.LatLng(65.0 , latlng.lng());
	}

	if (latlng.lat()  < -65.0)
	{
		latlng = new google.maps.LatLng(-65.0 , latlng.lng()); 
	}
	
	return latlng;
}

function NotifyCenterChanged()
{
	var cppContext = new CppContextHelper();
	cppContext.functionId = MAP_JSCALL_CALLBACK_EVENT;
	cppContext.eventType  = MapJSEventCenterChanged;
	var latlang = g_map.getCenter();
	
	if (latlang.lat() > 65.0 && g_map.getZoom() <= 2)
	{
		var resetLatLng  = new google.maps.LatLng(65.0 , latlang.lng()); 
		g_map.setCenter(resetLatLng);
		delete resetLatLng;
		return;
	}
	if (latlang.lat()  < -65.0 && g_map.getZoom() <= 2)
	{
		var resetLatLng  = new google.maps.LatLng(-65.0 , latlang.lng()); 
		g_map.setCenter(resetLatLng);
		delete resetLatLng;
		return;
	}
	
	cppContext.Lat = latlang.lat();
	cppContext.Lng = latlang.lng();
	
	var currentPos = GetCurrentCSSPos();

	if(currentPos)
	{
		cppContext.screenX = currentPos.x;
		cppContext.screenY = currentPos.y;
	}
	
	cppContext.Serialize();
}

function NotifyZoomChanged()
{
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
			ImageSize = new google.maps.Point(g_ImageData[MarkerType].ImageWidth, g_ImageData[MarkerType].ImageHeight);

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

	this.RegistMarkerEvent = function(markerInfo)
	{
		var markerType	= markerInfo.Type;
		var markerId	= markerInfo.Id;
		var markerObj	= markerInfo.Obj;
		
		google.maps.event.addListener(markerObj, 'click', function() 
		{
			this.SelectMarker(markerId);
			NotifySelectMarkerEvent(markerId, markerObj.getPosition());
		});	
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
		this.RegistMarkerEvent(markerInfo);
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
	
	this.CreateCurrentPosIcon();

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
			info.Obj.setZIndex(info.zOrgIndex);
        }
        
        if(newSelectId)
        {
            // 選択用に前面表示にする
    		var info = this.GetMarkerInfo(newSelectId);
			info.Obj.setZIndex(ZIndex_SelectObject);
        }
    }

	this.UpdateMarkerZIndex = function()
	{
		var Markers       = this.GetAllMakrers();
		var TargetMarkers = new Array();
		
		for(var i = 0; i < Markers.length; i++)
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

	this.GetAllMakrers = function()
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
    			this.SelectCircle.setVisible(true);
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
