import React from 'react';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import {Dropdown, DropdownButton, ButtonGroup, Button} from 'react-bootstrap';

import getcreateputGraphData, { months_ } from '../actions/graphActions';
import { getPolygonLayers } from '../actions/layerActions';
import { getIndicatorData } from '../actions/gridActions';

class IndicatorsLineGraph extends React.Component {
  constructor() {
    super();
    this.state = {
        dataset: [],
        selectedIndicator: "field_rainfall",
        indicatorObj: {
            "Rainfall": ["field_rainfall", "Precipitation (mm)"],
            "Vegetation Health": ["field_ndvi", "Vegetation Health Index (-1, 1)"],
            "Soil Moisture": ["field_ndwi", "Soil Moisture Index (-1, 1)"],
            "Ground Temperature": ["field_temperature", "Ground Temperature (°Celcius)"]
        },
        displayedIndicator: "Rainfall",
        selectedCropType: "Crop Type",
        cropTypes: [],
        FieldindicatorArray: [],
        allFieldsIndicatorArray: []
    }
  }

  async componentDidMount() {
    await this.props.dispatch(getIndicatorData())
    await this.props.dispatch(getcreateputGraphData(
      {}, 'GET', "", "", this.props.cropTypes,
      this.props.LayersPayload, this.props.katorPayload
    ))
    let cropTypes = this.props.cropTypes
    // this isn't setting croptypes for admins
    this.setState({
      ...this.state,
      cropTypes,
      allFieldsIndicatorArray: this.props.allFieldsIndicatorArray,
      dataset: this.props.allFieldData["field_rainfall"] ?
       this.props.allFieldData["field_rainfall"][cropTypes[0]] : []
    })
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.fieldId !== "" && prevProps.fieldId !== this.props.fieldId
    ) {
      // block to display one field's data by uncollapsing sidepanel
      this.setState({
        ...this.state,
        dataset: this.props.field_data["field_rainfall"][this.props.cropType],
        FieldindicatorArray: this.props.FieldindicatorArray,
        selectedCropType: this.props.cropType,
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      (this.props.fieldId === "" && !Object.keys(this.props.groupFieldData).length ) &&
       prevProps.SidePanelCollapsed !== this.props.SidePanelCollapsed
    ) {
      // block to display all fields data by uncollapsing sidepanel
      let { cropTypes, allFieldData } = this.props
      this.setState({
        ...this.state,
        cropTypes,
        dataset: allFieldData["field_rainfall"] ?
         allFieldData["field_rainfall"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      Object.keys(this.props.groupFieldData).length &&
       prevProps.SidePanelCollapsed !== this.props.SidePanelCollapsed
    ) {
      // block to display group field data and uncollapse sidepanel
      let { groupFieldData } = this.props
      let groupCrops = Object.keys(groupFieldData.field_rainfall)
      this.setState({
        ...this.state,
        dataset: this.props.groupFieldData["field_rainfall"] ?
         this.props.groupFieldData["field_rainfall"][groupCrops[0]] : [],
         FieldindicatorArray: this.props.FieldindicatorArray,
        selectedCropType: groupCrops[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      (prevProps.fieldId !== this.props.fieldId && this.props.fieldId === "") ||
      (Object.keys(prevProps.groupFieldData).length &&
        !Object.keys(this.props.groupFieldData).length)
    ) {
      // block to display allFieldData when sidepanel ain't collapsed
      let { cropTypes, allFieldData } = this.props
      this.setState({
        ...this.state,
        cropTypes,
        dataset: allFieldData["field_rainfall"] ?
         allFieldData["field_rainfall"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    }
  }

  getEvent = eventKey => {
    if (typeof(eventKey) === "string") {
      let { allFieldData, fieldId, field_data, groupFieldData } = this.props;
      let cropTypes = this.state.cropTypes;
      if (cropTypes.includes(eventKey)) {
        this.setState({
          dataset: fieldId === "" && !Object.keys(groupFieldData).length ?
           allFieldData[this.state.selectedIndicator][eventKey]
            :fieldId === "" && Object.keys(groupFieldData).length ?
            groupFieldData[this.state.selectedIndicator][eventKey]
            : field_data[this.state.selectedIndicator][eventKey],
          selectedCropType: eventKey
        })
      } else {
        this.setState({
          dataset: fieldId === "" ?
           allFieldData[this.state.indicatorObj[eventKey][0]][this.state.selectedCropType]
            : field_data[this.state.indicatorObj[eventKey][0]][this.state.selectedCropType],
          selectedIndicator: this.state.indicatorObj[eventKey][0],
          displayedIndicator: eventKey
        })
      }
    }
  }

  render () {
    let { 
      displayedIndicator, indicatorObj, allFieldsIndicatorArray,
      selectedCropType, FieldindicatorArray, dataset, cropTypes
     } = this.state
     let { groupFieldIndicatorArray } = this.props;

    return (
      <React.Fragment>
        <style type="text/css">
        {`
        .btn-dropdown {
            background-color: #e15b26;
            color: white;
        }
        .dropdown-item.active, .dropdown-item:active {
            color: #fff;
            text-decoration: none;
            background-color: #e15b26;
        }
        #indicator_download_button {
          
          background-color: #e15b26;
          border-color: #e15b26;
        }
        a {
          color: white;
        }
        a:hover {
          color: black;
          text-decoration: none;
        }
        `}
        </style>
        <DropdownButton
        variant={"dropdown"}
        className="mr-1"
        id="dropdown-basic-button"
        title={displayedIndicator}
        as={ButtonGroup}
        >
          {Object.keys(indicatorObj).map(obj_ => 
              <Dropdown.Item key={obj_} eventKey={obj_} onSelect={this.getEvent}>
                  {obj_}
              </Dropdown.Item>
          )}
        </DropdownButton>
        <DropdownButton
        variant={"dropdown"}
        id="dropdown-basic-button"
        title={this.props.fieldId === "" ? selectedCropType : this.props.cropType}
        as={ButtonGroup}
        >
          {/* NOTE: this should remain as getting from redux state because actual
          croptypes are not yet gotten from the backend by the time component is mounted...hehe. mounted. */}
          {
            this.props.fieldId === "" &&
            Object.keys(this.props.groupFieldData).length ?
            Object.keys(this.props.groupFieldData.field_rainfall).map(type_ => 
                <Dropdown.Item key={type_} eventKey={type_} onSelect={this.getEvent}>
                    {type_}
                </Dropdown.Item>
            ) :
              this.props.fieldId === "" &&
              !Object.keys(this.props.groupFieldData).length ? cropTypes.map(type_ => 
                <Dropdown.Item key={type_} eventKey={type_} onSelect={this.getEvent}>
                    {type_}
                </Dropdown.Item>
            ) : ""
          }
        </DropdownButton>
        {' '}
        <Button id="indicator_download_button">
          <CSVLink
          // if indicatorsArray is undefined will return an error,
          // so need to check for it
           data={
             this.props.fieldId ?
              FieldindicatorArray ? FieldindicatorArray : []
               :
              Object.keys(this.props.groupFieldData).length ?
              groupFieldIndicatorArray :
              allFieldsIndicatorArray
            }
           target="_blank"
           filename={
             this.props.fieldId ?
              `${this.props.fieldId}_indicators_data.csv` : "indicators_data.csv"
           }
          >
          Download Data
          </CSVLink>
        </Button>
        <br/><br/>
        <Line
          data={
              {
                  "labels": months_,
                  "datasets": [{
                      "label": indicatorObj[displayedIndicator][1],
                      "data": dataset,
                      "fill": false,
                      "borderColor": "rgb(75, 192, 192)",
                      "lineTension": 0.1 
                  }]
              }
          }
          options={{
            title: {
                display: true,
                position: "top",
                fontSize: 18,
                text: `${
                  this.props.fieldId ? "Field Identifier: " + this.props.fieldId :
                  Object.keys(this.props.groupFieldData).length ?
                  // division of 4 is because there are 4 indicators
                   `Indicator Chart for ${
                    (this.props.groupFieldIndicatorArray.length - 1) / 4
                   } fields` : "All fields"
                }`
            },
              legend: {
                  display: true,
                  position: "bottom",
              },
              scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: indicatorObj[displayedIndicator][1]
                    }
                  }],
                  xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: "months"
                    }
                  }],
                }
          }}
          height={120}
          ref={this.chartReference}
        />
      </React.Fragment>
    )
  }

}

const mapStateToProps = state => ({
  FieldindicatorArray: state.graphs.FieldindicatorArray,
  allFieldsIndicatorArray: state.graphs.allFieldsIndicatorArray,
  groupFieldIndicatorArray: state.graphs.groupFieldIndicatorArray,
  field_data: state.graphs.field_data,
  allFieldData: state.graphs.allFieldData,
  groupFieldIndicatorArray: state.graphs.groupFieldIndicatorArray,
  groupFieldData: state.graphs.groupFieldData,
  fieldId: state.graphs.fieldId,
  cropType: state.graphs.cropType,
  cropTypes: state.layers.cropTypes,
  LayersPayload: state.layers.LayersPayload,
  katorPayload: state.grid.katorPayload
});

const matchDispatchToProps = dispatch => ({
  getPolygonLayers,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(IndicatorsLineGraph);
