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
import { CloudArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import axios from 'axios';

const Prediction = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [predictionType, setPredictionType] = useState('direct');
  const [file, setFile] = useState(null);
  const [directInput, setDirectInput] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [trainedModels, setTrainedModels] = useState([]);

  const supportedFormats = '.csv, .xlsx, .xls';

  useEffect(() => {
    fetchModels();
  }, []);

   const fetchModels = async () => {
    try {
      const response = await axios.get('http://localhost:5000/models');
      setTrainedModels(response.data.trained_models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

    const handlePredict = async () => {
    try {
      if (predictionType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedModel);

        const response = await axios.post('http://localhost:5000/predict/file', formData, {
          responseType: 'blob',
        });

        // Create download link for the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'predictions.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const response = await axios.post('http://localhost:5000/predict', {
          type: 'direct',
          data: directInput,
          model: selectedModel,
        });
        setPredictions(response.data.predictions);
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
          >
            {trainedModels.map((model) => (
              <Option key={model} value={model}>
                {model}
              </Option>
            ))}
          </Select>

          <div className="flex gap-4">
            <Button
              variant={predictionType === 'direct' ? 'filled' : 'outlined'}
              color="black"
              className="flex-1"
              onClick={() => setPredictionType('direct')}
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

          {predictionType === 'direct' ? (
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
            disabled={!selectedModel || (predictionType === 'direct' ? !directInput : !file)}
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
        </div>
      </CardBody>
    </Card>
  );
};

export default Prediction;
