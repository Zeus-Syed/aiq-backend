import { AppserviceService } from './appservice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { state } from '@angular/animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;

  top: number = 3;
  selectedState: string = 'Choose State';
  markers: any = [];
  plantData: any = [];
  stateData: any = [];
  zoom = 5;
  center: any;
  options: any = {
    mapTypeId: 'hybrid',
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 0,
  };
  infoContent: any = {
    title: 'tets',
    netGeneration: '300',
    state: 'AT',
    percentage: '',
  };

  constructor(private appService: AppserviceService) {}

  ngOnInit() {
    this.center = {
      lat: 37.9308,
      lng: -100.9725,
    };

    this.fetchGridData();
    // this.addMarker();
  }

  changeState = (event: any) => {
    console.log('event', event.target.value);
    this.selectedState = event.target.value;
    this.markers = [];
    if (event.target.value === 'Choose State') {
      this.center = {
        lat: 37.9308,
        lng: -100.9725,
      };
      this.zoom = 5;
      let finalPlantData = this.considerPlantDataBasedOnTopValue(this.plantData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    } else {
      this.preparePlantDataForState(event.target.value);
      // let filteredStateData = this.plantData.filter(
      //   (plantObject: any) => plantObject.plantState === event.target.value
      // );
      // if (filteredStateData && filteredStateData.length > 0) {
      //   this.center = {
      //     lat: filteredStateData[0].latitude,
      //     lng: filteredStateData[0].longitude,
      //   };
      //   this.zoom = 8;
      //   let finalPlantData = this.considerPlantDataBasedOnTopValue(filteredStateData, this.stateData, this.top)
      //   this.processPlantData(finalPlantData);
      // }
    }
  };

  changeTopState = (event: any) => {
    console.log('event', event.target.value);
    this.top = parseInt(event.target.value);

      this.markers = [];
    if (this.selectedState === 'Choose State') {
      this.center = {
        lat: 37.9308,
      lng: -100.9725,
      };
      this.zoom = 8;
      let finalPlantData = this.considerPlantDataBasedOnTopValue(this.plantData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    } else {
      this.preparePlantDataForState(this.selectedState);
      // let filteredStateData = this.plantData.filter(
      //   (plantObject: any) => plantObject.plantState === event.target.value
      // );
      // if (filteredStateData && filteredStateData.length > 0) {
      //   this.center = {
      //     lat: filteredStateData[0].latitude,
      //     lng: filteredStateData[0].longitude,
      //   };
      //   this.zoom = 8;
      //   let finalPlantData = this.considerPlantDataBasedOnTopValue(filteredStateData, this.stateData, this.top)
      //   this.processPlantData(finalPlantData);
      // }
    }
  }

  preparePlantDataForState = (selectedState : any) => {
    let filteredStateData = this.plantData.filter(
      (plantObject: any) => plantObject.plantState === selectedState
    );
    if (filteredStateData && filteredStateData.length > 0) {
      this.center = {
        lat: filteredStateData[0].latitude,
        lng: filteredStateData[0].longitude,
      };
      this.zoom = 8;
      let finalPlantData = this.considerPlantDataBasedOnTopValue(filteredStateData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    }
  }

  fetchGridData = () => {
    this.appService.getPlantData().subscribe(
      (response) => {
        console.log('response', response);
        if (response.success === true) {
          this.plantData = response.data.plantData;
          this.stateData = response.data.stateData;
          let arrayToConsider = this.considerPlantDataBasedOnTopValue(response.data.plantData, response.data.stateData, this.top)
          this.processPlantData(arrayToConsider);
        }
      },
      (error) => console.error(error)
    );
  };

  addMarker() {
    this.markers.push({
      position: {
        lat: 37.9308,
        lng: -100.9725,
      },
      // label: {
      //   color: 'red',
      //   text: 'Marker label ' + (this.markers.length + 1),
      // },
      title: 'Marker title ' + (this.markers.length + 1),
      // options: { animation: google.maps.Animation.DROP },
      netGeneration: '500',
    });
  }

  openInfo(marker: any, content: any) {
    this.infoContent.title = content.title;
    this.infoContent.netGeneration = content.netGeneration;
    this.infoContent.state = content.state;
    this.infoContent.percentage = content.percentage;
    this.info?.open(marker);
  }

  processPlantData = (plantData: any) => {
    plantData.map((object: any) => {
      this.markers.push({
        position: {
          lat: object.latitude,
          lng: object.longitude,
        },
        title: object.name,
        netGeneration: object.netGeneration,
        state: object.plantState,
        percentage: object.percentage,
      });
    });
  };

  compare = (a: any, b: any) => {
    if (a.netGeneration < b.netGeneration) {
      return -1;
    }
    if (a.netGeneration > b.netGeneration) {
      return 1;
    }
    return 0;
  };

  considerPlantDataBasedOnTopValue = (
    plantData: any,
    stateData: any,
    noOfPlants: number
  ) => {
    let finalArray: any = [];
    stateData.map((stateObj: any) => {
      let filteredArray = plantData.filter(
        (plantObj: any) => plantObj.plantState === stateObj
      );
      if (filteredArray.length > 0) {
        filteredArray.sort(this.compare);
        if (filteredArray.length > noOfPlants) {
          let topArray = filteredArray.slice(0, noOfPlants);
          finalArray = [...finalArray, ...topArray];
        } else {
          finalArray = [...finalArray, ...filteredArray];
        }
      }
    });
    return finalArray;
  };

  zoomIn() {
    if (this.zoom < this.options.maxZoom) this.zoom++;
  }

  zoomOut() {
    if (this.zoom > this.options.minZoom) this.zoom--;
  }
}
