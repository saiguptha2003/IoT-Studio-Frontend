import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  DocumentTextIcon,
  ArrowDownTrayIcon 
} from "@heroicons/react/24/outline";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Prediction = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [predictionType, setPredictionType] = useState('input');
  const [file, setFile] = useState(null);
  const [directInput, setDirectInput] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [trainedModels, setTrainedModels] = useState([]);
  const [predictedFile, setPredictedFile] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState('');

  const authToken = localStorage.getItem("authToken");

  const supportedFormats = '.csv, .xlsx, .xls';

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    style: {
      backgroundColor: 'white',
      color: 'black',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

   const fetchModels = async () => {
    try {
      const modelsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/services/SmartML/mlTrain`, {
        headers: {
          "Authorization": authToken,
        },
      });
      setTrainedModels(modelsResponse.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

    const handlePredict = async () => {
    try {
      if (predictionType === 'file' && file) {
        const formData = new FormData();
        formData.append('type', 'file');
        formData.append('file', file);
        formData.append('trainId', selectedModel);
        
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/services/SmartML/mlPredict`, 
          formData, 
          {
            headers: {
              "Authorization": authToken,
              'Content-Type': 'multipart/form-data'
            },
            responseType: 'blob'
          }
        );
  
        // Create blob URL for preview/download
        const blob = new Blob([response.data]);
        const fileUrl = window.URL.createObjectURL(blob);
        setPredictedFile(fileUrl);
        
        // Get filename from response headers
        const contentDisposition = response.headers['content-disposition'];
        const filenameMatch = contentDisposition && contentDisposition.match(/download_name="?([^"]+)"?/);
        const filename = filenameMatch ? filenameMatch[1] : 'predicted-data.csv';
        setDownloadFileName(filename);
        
        toast.success('Prediction file ready for download', toastConfig);
      } else {
        const formData = new FormData();
        formData.append('type', predictionType);
        formData.append('input_data', directInput);
        formData.append('trainId', selectedModel);

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/services/SmartML/mlPredict`, formData, {
          headers: {
            "Authorization": authToken,
            'Content-Type': 'multipart/form-data'
          }
        });
        setPredictions(response.data.predictions);
        toast.success('Prediction Successful', toastConfig);
      }
    } catch (error) {
      console.error('Error during prediction:', error);
    }
  };


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardBody className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <DocumentTextIcon className="w-8 h-8 text-black" />
          <Typography variant="h4" className="font-bold text-black">
            Make Predictions
          </Typography>
        </div>

        <div className="space-y-6">
        <Select
          label="Select Model"
          value={selectedModel}
          onChange={(value) => setSelectedModel(value)}
          className="text-black"
          labelProps={{
            className: "text-black"
          }}
        >
          {trainedModels.map((model) => {
            return (
              <Option key={model.title} value={model.trainId}>
                {model.title} - {model.model}
              </Option>
            );
          })}
        </Select>

          <div className="flex gap-4">
            <Button
              variant={predictionType === 'input' ? 'filled' : 'outlined'}
              color="black"
              className="flex-1"
              onClick={() => setPredictionType('input')}
            >
              Direct Input
            </Button>
            <Button
              variant={predictionType === 'file' ? 'filled' : 'outlined'}
              color="black"
              className="flex-1"
              onClick={() => setPredictionType('file')}
            >
              File Upload
            </Button>
          </div>

          {predictionType === 'input' ? (
            <Textarea
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              label="Enter your input data. Eg: [[1, 2, 3], [4, 5, 6]]"
              className="min-h-[100px]"
            />
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                accept={supportedFormats}
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outlined"
                color="black"
                className="w-full"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                {file ? file.name : 'Choose File'}
              </Button>
              <Typography variant="small" color="gray" className="mt-2">
                Supported formats: {supportedFormats}
              </Typography>
            </div>
          )}

          <Button
            variant="gradient"
            color="black"
            className="w-full"
            onClick={handlePredict}
            disabled={!selectedModel || (predictionType === 'input' ? !directInput : !file)}
          >
            Make Prediction
          </Button>

          {predictions && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Predictions:
              </Typography>
              <pre className="bg-white p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(predictions, null, 2)}
              </pre>
            </div>
          )}
          {predictedFile && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Download Predictions:
              </Typography>
              <div className="bg-white p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="w-6 h-6 text-black" />
                  <span className="text-sm font-medium">{downloadFileName}</span>
                </div>
                <Button
                  variant="gradient"
                  color="black"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = predictedFile;
                    link.download = downloadFileName;
                    link.click();
                  }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default Prediction;
