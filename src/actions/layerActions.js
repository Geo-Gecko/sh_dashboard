// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';
import {
  GET_LAYERS_SUCCESS
} from './types';

export const postPointLayer = postData => {
    return axiosInstance
      .post('/layers/listcreatepointlayer/', postData)
      .then(response => {
          console.log("Layer saved", response)
      })
      .catch(error => {
        console.log(error)
      });
  };

export const postPolygonLayer = postData => {
return axiosInstance
    .post('/layers/listcreatepolygonlayer/', postData)
    .then(response => {
        console.log("Layer saved", response)
    })
    .catch(error => {
    console.log(error)
    });
};

export const getPolygonLayers = () => dispatch => {
  return axiosInstance
      .get('/layers/listcreatepolygonlayer/')
      .then(response => {
          let cropTypes = new Set()
          response.data.features.forEach(feature_ => {
            if(feature_.properties.field_attributes.CropType){
              cropTypes.add(feature_.properties.field_attributes.CropType)
            }
          })
          dispatch({
            type: GET_LAYERS_SUCCESS,
            payload: {
              LayersPayload: response.data,
              cropTypes: Array.from(cropTypes)
            }
          })
          return response.data
      })
      .catch(error => {
      console.log(error)
      });
  };


export const updatePolygonLayer = layer_ => {
  return axiosInstance
      .put(`/layers/getupdatedeletelayer/${layer_.properties.field_id}/`, layer_)
      .then(response => {
          console.log("Layer has been edited", response.data)
      })
      .catch(error => {
      console.log(error)
      });
  };


export const deletePolygonLayer = (field_id, layer_) => {
  return axiosInstance
      .delete(`/layers/getupdatedeletelayer/${field_id}/`)
      .then(() => {
          console.log("Layer has been deleted")
      })
      .catch(error => {
      console.log(error)
      });
  };
