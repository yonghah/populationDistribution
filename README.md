# populationDistribution

- 통계청 집계구 인구를 50m 이상 크기의 그리드에 재분배하는 R코드입니다.

- R 노트북으로 작성된 rmd 파일입니다. Rstudio 에서 열 수 있습니다.
- cpp 파일은 Rcpp 용으로 작성된 파일입니다. rmd 에서 호출하여 사용합니다.
- 코드에 대한 설명은 다음을 참고하세요.
- https://www.vw-lab.com/85

- resultShp 폴더에는 2020년 집계구 경계 기준으로 작업한 250미터 전국 인구 격자 shp 파일이 있습니다.
- 이 코드의 결과물로 만든 파일들입니다.

# Fork

https://github.com/vuski/populationDistribution 을 fork하여 여기서 생성된 250미터 인구격자를
웹에서 볼 수 있도록 

- 벡터타일을 제작하는 스크립트
- 웹 애플리케이션 

을 추가하였습니다


## 벡터타일의 제작

가능하면 모든 프로세스들이 재현 가능하도록 작업하였습니다.

### shp → tiff  변환

분리된 shapefile들을 하나의 격자로 만들기 위해 개별 그리드 shapefile을 각각 geotiff raster로 변환합니다. gdal을 이용하였습니다.

```bash
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2000.shp ../data/tiff/popu250grid_2000.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2005.shp ../data/tiff/popu250grid_2005.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2010.shp ../data/tiff/popu250grid_2010.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2015.shp ../data/tiff/popu250grid_2015.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2016.shp ../data/tiff/popu250grid_2016.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2017.shp ../data/tiff/popu250grid_2017.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2018.shp ../data/tiff/popu250grid_2018.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2019.shp ../data/tiff/popu250grid_2019.tiff
```

그리고 이 raster들을 stack하여 각각의 연도가 개별 band인 multiband raster를 만들었습니다.  rasterio를 이용하였습니다.

```bash
rio stack \
../data/tiff/popu250grid_2000.tiff \
../data/tiff/popu250grid_2005.tiff \
../data/tiff/popu250grid_2010.tiff \
../data/tiff/popu250grid_2015.tiff \
../data/tiff/popu250grid_2016.tiff \
../data/tiff/popu250grid_2017.tiff \
../data/tiff/popu250grid_2018.tiff \
../data/tiff/popu250grid_2019.tiff \
../data/tiff/popu250grid_stacked.tiff
```

분리된 shapefile들을 하나의 격자로 만들기 위해 개별 그리드 shapefile을 각각 geotiff raster로 변환합니다. gdal을 이용하였습니다.

```bash
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2000.shp ../data/tiff/popu250grid_2000.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2005.shp ../data/tiff/popu250grid_2005.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2010.shp ../data/tiff/popu250grid_2010.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2015.shp ../data/tiff/popu250grid_2015.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2016.shp ../data/tiff/popu250grid_2016.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2017.shp ../data/tiff/popu250grid_2017.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2018.shp ../data/tiff/popu250grid_2018.tiff
gdal_rasterize -tr 250m 250m -a value -a_nodata -1 ../resultShp/popu250grid_2019.shp ../data/tiff/popu250grid_2019.tiff
```

그리고 이 raster들을 stack하여 각각의 연도가 개별 band인 multiband raster를 만들었습니다.  rasterio를 이용하였습니다.

```bash
rio stack \
../data/tiff/popu250grid_2000.tiff \
../data/tiff/popu250grid_2005.tiff \
../data/tiff/popu250grid_2010.tiff \
../data/tiff/popu250grid_2015.tiff \
../data/tiff/popu250grid_2016.tiff \
../data/tiff/popu250grid_2017.tiff \
../data/tiff/popu250grid_2018.tiff \
../data/tiff/popu250grid_2019.tiff \
../data/tiff/popu250grid_stacked.tiff
```

### raster를 point로 변환

이게 gdal/ogr이나 rasterio로 잘 안되어서 그냥  QGIS 열고 작업했습니다. 

1) stack된 raster를 불러온뒤, 

2) Point Sampling Plugin으로 container가 될 벡터 grid를 만들고

3) Processing Tool > Vector Creation > Raster Pixels to Point

하면 모든 band의 데이터들이 point feature의 column으로 잘 들어갑니다. 이걸 geojson으로 저장합니다.

### 벡터타일 만들기

앞에서 geojson으로 저장한 이유는 tippecanoe로 벡터 타일을 만들기 위해서 였습니다.

```bash
tippecanoe -z15 -Z6 -e tiles -pC -pf -pk -B9 -r1 --force ../data/point/popu250grid_stacked.geojson
```

이렇게 해서 압축안된 pbf 타일들을 디렉토리에 저장합니다. 그러면 별다른 GIS server 없이도 웹서버에서 바로 타일 서비스를 할 수 있습니다.

## 웹애플리케이션

mapboxgl.js로 구현하였고, 앞서말했듯이 별다른 gis 서버 없이 타일을 S3에서 바로 서비스하는 간단한 구성입니다. 

https://pop250grid.s3.amazonaws.com/index.html

