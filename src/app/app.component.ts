import { AppserviceService } from './appservice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { coordinates, Info, MapOptions, Marker, Plant } from './interface';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;

  top: number = 3;
  selectedState: string = 'Choose State';
  markers: Marker[] = [];
  plantData: Plant[] = [];
  stateData: string[] = [];
  zoom: number = 5;
  center: coordinates = {
    lat: 37.9308,
    lng: -100.9725,
  };
  options: MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 0,
  };
  infoContent: Info = {
    title: 'tets',
    netGeneration: 300,
    state: 'AT',
    percentage: '',
  };

  constructor(private appService: AppserviceService) { }

  ngOnInit() {
    this.center = {
      lat: 37.9308,
      lng: -100.9725,
    };
    this.fetchGridData();
  }

  changeState = (event: any): void => {
    this.selectedState = event.target.value;
    this.markers = [];
    if (event.target.value === 'Choose State') {
      this.center = {
        lat: 37.9308,
        lng: -100.9725,
      };
      this.zoom = 5;
      let finalPlantData: Plant[] = this.considerPlantDataBasedOnTopValue(this.plantData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    } else {
      this.preparePlantDataForState(event.target.value);
    }
  };

  changeTopState = (event: any): void => {
    this.top = parseInt(event.target.value);
    this.markers = [];
    if (this.selectedState === 'Choose State') {
      this.center = {
        lat: 37.9308,
        lng: -100.9725,
      };
      this.zoom = 8;
      let finalPlantData: Plant[] = this.considerPlantDataBasedOnTopValue(this.plantData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    } else {
      this.preparePlantDataForState(this.selectedState);
    }
  }

  preparePlantDataForState = (selectedState: string): void => {
    let filteredStateData: Plant[] = this.plantData.filter(
      (plantObject: Plant) => plantObject.plantState === selectedState
    );
    if (filteredStateData && filteredStateData.length > 0) {
      this.center = {
        lat: filteredStateData[0].latitude,
        lng: filteredStateData[0].longitude,
      };
      this.zoom = 8;
      let finalPlantData: Plant[] = this.considerPlantDataBasedOnTopValue(filteredStateData, this.stateData, this.top)
      this.processPlantData(finalPlantData);
    }
  }

  fetchGridData = (): void => {
    this.appService.getPlantData().subscribe(
      (response) => {
        if (response.success === true) {
          console.log('response', response.data.plantData)
          this.plantData = response.data.plantData;
          this.stateData = response.data.stateData;
          let arrayToConsider: Plant[] = this.considerPlantDataBasedOnTopValue(response.data.plantData, response.data.stateData, this.top)
          this.processPlantData(arrayToConsider);
        }
      },
      (error) => console.error(error)
    );
  };

  openInfo(marker: MapMarker, content: Marker): void {
    this.infoContent.title = content.title;
    this.infoContent.netGeneration = content.netGeneration;
    this.infoContent.state = content.state;
    this.infoContent.percentage = content.percentage;
    this.info?.open(marker);
  }

  processPlantData = (plantData: Plant[]): void => {
    plantData.map((plant: Plant) => {
      this.markers.push({
        position: {
          lat: plant.latitude,
          lng: plant.longitude,
        },
        title: plant.name,
        netGeneration: plant.netGeneration,
        state: plant.plantState,
        percentage: plant.percentage,
      });
    });
  };

  compare = (a: Plant, b: Plant): number => {
    if (a.netGeneration < b.netGeneration) {
      return -1;
    }
    if (a.netGeneration > b.netGeneration) {
      return 1;
    }
    return 0;
  };

  considerPlantDataBasedOnTopValue = (
    plantData: Plant[],
    stateData: string[],
    noOfPlants: number
  ): Plant[] => {
    let finalArray: Plant[] = [];
    stateData.map((stateObj: string) => {
      let filteredArray = plantData.filter(
        (plantObj: Plant) => plantObj.plantState === stateObj
      );
      if (filteredArray.length > 0) {
        filteredArray.sort(this.compare);
        filteredArray.reverse();
        if (filteredArray.length > noOfPlants) {
          let topArray: Plant[] = filteredArray.slice(0, noOfPlants);
          finalArray = [...finalArray, ...topArray];
        } else {
          finalArray = [...finalArray, ...filteredArray];
        }
      }
    });
    return finalArray;
  };

  zoomIn(): void {
    if (this.zoom < this.options.maxZoom) this.zoom++;
  }

  zoomOut(): void {
    if (this.zoom > this.options.minZoom) this.zoom--;
  }
}
