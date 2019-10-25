console.log("CodeStart");
const express=require('express');
const GeoPosition=require('./GeoPosition.js');
const app=express();
var DataBase={};

port=3000;



app.get('/gis/testpoint',(req,res)=>{
    let ansObj={polygons :[]};
    for(let key in DataBase){
        if(new GeoPosition(req.query.lat,req.query.long).IsInsideArea(DataBase[key])){
            ansObj.polygons.push(key);
        }
    }
    res.send(JSON.stringify(ansObj));
});

app.put('/gis/addpolygon',(req,res)=>{
    let input = JSON.parse(req.query);
    DataBase[input.properties.name]=[];
    for(let index=0;index<input.geometry.coordinates[0].length;index++){
        DataBase[input.properties.name].push(new GeoPosition(input.geometry.coordinates[0][index][0],input.geometry.coordinates[0][index][1]));
    }
    res.send("Success")
});

app.listen(port,()=> {
    let input={ "features": [
        {
            "type": "Feature",
            "properties": {
              "stroke": "#555555",
              "stroke-width": 2,
              "stroke-opacity": 1,
              "fill": "#555555",
              "fill-opacity": 0.5,
              "name": "سمنان"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    52.2894287109375,
                    35.387930399448095
                  ],
                  [
                    52.20977783203124,
                    35.40808023595146
                  ],
                  [
                    52.12188720703125,
                    35.475209977972064
                  ],
                  [
                    51.943359375,
                    35.556808973844596
                  ],
                  [
                    51.862335205078125,
                    35.576916524038616
                  ],
                  [
                    51.8115234375,
                    35.380092992092145
                  ],
                  [
                    51.82388305664062,
                    35.290468565908775
                  ],
                  [
                    51.998291015625,
                    35.122155106436956
                  ],
                  [
                    52.35397338867187,
                    35.1614594458557
                  ],
                  [
                    52.47482299804687,
                    35.28710571680812
                  ],
                  [
                    52.2894287109375,
                    35.387930399448095
                  ]
                ]
              ]
            }
          },
        {
          "type": "Feature",
          "properties": {
            "stroke": "#555555",
            "stroke-width": 2,
            "stroke-opacity": 1,
            "fill": "#555555",
            "fill-opacity": 0.5,
            "name": "Test"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  53.514404296875,
                  34.59704151614417
                ],
                [
                  51.416015625,
                  34.854382885097905
                ],
                [
                  51.6851806640625,
                  33.82023008524739
                ],
                [
                  53.514404296875,
                  34.59704151614417
                ]
              ]
            ]
          }
        }
      ]};
    for(let i=0;i<2;i++){
      DataBase[input.features[i].properties.name]=[];
      for(let index=0;index<input.features[i].geometry.coordinates[0].length;index++){
          DataBase[input.features[i].properties.name].push(new GeoPosition(input.features[i].geometry.coordinates[0][index][0],input.features[i].geometry.coordinates[0][index][1]));
      }
    }
    console.log(`listening on port ${port}`);
});

