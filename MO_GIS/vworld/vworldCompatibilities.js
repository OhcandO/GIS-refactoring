export const vworld_compatibilities = `<?xml version="1.0" encoding="UTF-8"?><Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd">
<!-- Service Identification -->
<ows:ServiceIdentification>
    <ows:Title>Vworld Web Map Tile Service</ows:Title>
    <ows:ServiceType>OGC WMTS</ows:ServiceType>
    <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
</ows:ServiceIdentification>
<!-- Operations Metadata -->
<ows:OperationsMetadata>
    <ows:Operation name="GetCapabilities">
        <ows:DCP>
            <ows:HTTP>
                <ows:Get xlink:href="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/WMTSCapabilities.xml">
                    <ows:Constraint name="GetEncoding">
                        <ows:AllowedValues>
                            <ows:Value>RESTful</ows:Value>
                        </ows:AllowedValues>
                    </ows:Constraint>
                </ows:Get>
            </ows:HTTP>
        </ows:DCP>
    </ows:Operation>
    <ows:Operation name="GetTile">
        <ows:DCP>
            <ows:HTTP>
                <ows:Get xlink:href="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/">
                    <ows:Constraint name="GetEncoding">
                        <ows:AllowedValues>
                            <ows:Value>RESTful</ows:Value>
                        </ows:AllowedValues>
                    </ows:Constraint>
                </ows:Get>
            </ows:HTTP>
        </ows:DCP>
    </ows:Operation>
</ows:OperationsMetadata>
<Contents>
    <!--Layer -->
    <Layer>
        <ows:Title>VworldBase</ows:Title>
        <ows:Identifier>Base</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::3857">
            <ows:LowerCorner>12523442.714243278 3130860.6785608195</ows:LowerCorner>
            <ows:UpperCorner>15654303.392804097 5635549.221409474</ows:UpperCorner>
        </ows:BoundingBox>
        <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
            <ows:LowerCorner>112.5 27.059125784374068</ows:LowerCorner>
            <ows:UpperCorner>140.625 45.089035564831036</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
            <ows:Title>Default Style</ows:Title>
            <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/png</Format>
        <TileMatrixSetLink>
            <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
        </TileMatrixSetLink>
        <ResourceURL format="image/png" resourceType="tile" template="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/Base/{TileMatrix}/{TileRow}/{TileCol}.png"/>
    </Layer>
    <Layer>
        <ows:Title>VworldGray</ows:Title>
        <ows:Identifier>gray</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::3857">
            <ows:LowerCorner>12523442.714243278 3130860.6785608195</ows:LowerCorner>
            <ows:UpperCorner>15654303.392804097 5635549.221409474</ows:UpperCorner>
        </ows:BoundingBox>
        <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
            <ows:LowerCorner>112.5 27.059125784374068</ows:LowerCorner>
            <ows:UpperCorner>140.625 45.089035564831036</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
            <ows:Title>Default Style</ows:Title>
            <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/png</Format>
        <TileMatrixSetLink>
            <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
        </TileMatrixSetLink>
        <ResourceURL format="image/png" resourceType="tile" template="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/gray/{TileMatrix}/{TileRow}/{TileCol}.png"/>
    </Layer>
    <Layer>
        <ows:Title>VworldMidnight</ows:Title>
        <ows:Identifier>midnight</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::3857">
            <ows:LowerCorner>12523442.714243278 3130860.6785608195</ows:LowerCorner>
            <ows:UpperCorner>15654303.392804097 5635549.221409474</ows:UpperCorner>
        </ows:BoundingBox>
        <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
            <ows:LowerCorner>112.5 27.059125784374068</ows:LowerCorner>
            <ows:UpperCorner>140.625 45.089035564831036</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
            <ows:Title>Default Style</ows:Title>
            <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/png</Format>
        <TileMatrixSetLink>
            <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
        </TileMatrixSetLink>
        <ResourceURL format="image/png" resourceType="tile" template="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/midnight/{TileMatrix}/{TileRow}/{TileCol}.png"/>
    </Layer>
    <Layer>
        <ows:Title>VworldHybrid</ows:Title>
        <ows:Identifier>Hybrid</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::3857">
            <ows:LowerCorner>12523442.714243278 3130860.6785608195</ows:LowerCorner>
            <ows:UpperCorner>15654303.392804097 5635549.221409474</ows:UpperCorner>
        </ows:BoundingBox>
        <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
            <ows:LowerCorner>112.5 27.059125784374068</ows:LowerCorner>
            <ows:UpperCorner>140.625 45.089035564831036</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
            <ows:Title>Default Style</ows:Title>
            <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/png</Format>
        <TileMatrixSetLink>
            <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
        </TileMatrixSetLink>
        <ResourceURL format="image/png" resourceType="tile" template="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/Hybrid/{TileMatrix}/{TileRow}/{TileCol}.png"/>
    </Layer>
    <Layer>
        <ows:Title>VworldSatellite</ows:Title>
        <ows:Identifier>Satellite</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::3857">
            <ows:LowerCorner>12523442.714243278 3130860.6785608195</ows:LowerCorner>
            <ows:UpperCorner>15654303.392804097 5635549.221409474</ows:UpperCorner>
        </ows:BoundingBox>
        <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
            <ows:LowerCorner>112.5 27.059125784374068</ows:LowerCorner>
            <ows:UpperCorner>140.625 45.089035564831036</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
            <ows:Title>Default Style</ows:Title>
            <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/jpeg</Format>
        <TileMatrixSetLink>
            <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
        </TileMatrixSetLink>
        <ResourceURL format="image/jpeg" resourceType="tile" template="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/Satellite/{TileMatrix}/{TileRow}/{TileCol}.jpeg"/>
    </Layer>
    <!--TileMatrixSet -->
    <TileMatrixSet>
        <ows:Title>GoogleMapsCompatible</ows:Title>
        <ows:Abstract>the wellknown 'GoogleMapsCompatible' tile matrix set defined by OGC WMTS specification</ows:Abstract>
        <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
        <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
        <WellKnownScaleSet>urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible</WellKnownScaleSet>
        <TileMatrix>
            <ows:Identifier>6</ows:Identifier>
            <ScaleDenominator>8735660.37545</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>64</MatrixWidth>
            <MatrixHeight>64</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>7</ows:Identifier>
            <ScaleDenominator>4367830.18772</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>128</MatrixWidth>
            <MatrixHeight>128</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>8</ows:Identifier>
            <ScaleDenominator>2183915.09386</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>256</MatrixWidth>
            <MatrixHeight>256</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>9</ows:Identifier>
            <ScaleDenominator>1091957.54693</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>512</MatrixWidth>
            <MatrixHeight>512</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>10</ows:Identifier>
            <ScaleDenominator>545978.773466</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>1024</MatrixWidth>
            <MatrixHeight>1024</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>11</ows:Identifier>
            <ScaleDenominator>272989.386733</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>2048</MatrixWidth>
            <MatrixHeight>2048</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>12</ows:Identifier>
            <ScaleDenominator>136494.693366</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>4096</MatrixWidth>
            <MatrixHeight>4096</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>13</ows:Identifier>
            <ScaleDenominator>68247.3466832</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>8192</MatrixWidth>
            <MatrixHeight>8192</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>14</ows:Identifier>
            <ScaleDenominator>34123.6733416</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>16384</MatrixWidth>
            <MatrixHeight>16384</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>15</ows:Identifier>
            <ScaleDenominator>17061.8366708</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>32768</MatrixWidth>
            <MatrixHeight>32768</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>16</ows:Identifier>
            <ScaleDenominator>8530.9183354</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>65536</MatrixWidth>
            <MatrixHeight>65536</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>17</ows:Identifier>
            <ScaleDenominator>4265.4591677</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>131072</MatrixWidth>
            <MatrixHeight>131072</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>18</ows:Identifier>
            <ScaleDenominator>2132.72958385</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>262144</MatrixWidth>
            <MatrixHeight>262144</MatrixHeight>
        </TileMatrix>
        <TileMatrix>
            <ows:Identifier>19</ows:Identifier>
            <ScaleDenominator>1066.36479192</ScaleDenominator>
            <TopLeftCorner>-20037508.3428 20037508.3428</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>524288</MatrixWidth>
            <MatrixHeight>524288</MatrixHeight>
        </TileMatrix>
    </TileMatrixSet>
</Contents>
<ServiceMetadataURL xlink:href="http://api.vworld.kr/req/wmts/1.0.0/{{{ $APIKEY }}}/WMTSCapabilities.xml"/>
</Capabilities>`;