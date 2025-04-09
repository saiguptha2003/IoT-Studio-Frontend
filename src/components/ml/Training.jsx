import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Input,
  Alert,
} from "@material-tailwind/react";
import { BeakerIcon, ArrowUpTrayIcon, CogIcon } from "@heroicons/react/24/solid";
import axios from 'axios';

const Training = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelParams, setModelParams] = useState({});
  const [trainingResult, setTrainingResult] = useState(null);

  useEffect(() => {
    // Fetch datasets and models
    const fetchData = async () => {
      try {
        const datasetsResponse = await axios.get('/api/datasets');
        setDatasets(datasetsResponse.data);
        const modelsResponse = await axios.get('/api/models');
        setAvailableModels(modelsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/api/upload', formData);
      setFile(null);
      // Refresh datasets
      const datasetsResponse = await axios.get('/api/datasets');
      setDatasets(datasetsResponse.data);
    } catch (error) {
      setUploadError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleModelChange = (event) => {
    const modelName = event.target.value;
    setSelectedModel(modelName);
    const model = availableModels.find((m) => m.name === modelName);
    setModelParams(model ? model.parameters : {});
  };

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setModelParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleTrain = async () => {
    if (!selectedDataset || !selectedModel) return;
    try {
      const response = await axios.post('/api/train', {
        dataset: selectedDataset,
        model: selectedModel,
        parameters: modelParams,
      });
      setTrainingResult(response.data);
    } catch (error) {
      console.error('Error training model:', error);
    }
  };

  const formatMetricValue = (value) => {
    return value.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dataset Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white">
        <CardBody className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <ArrowUpTrayIcon className="w-8 h-8 text-black" />
            <Typography variant="h4" className="font-bold text-black">
              Upload Dataset
            </Typography>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                className="hidden"
                accept=".csv,.xlsx,.xls"
              />
              <Button
                variant="outlined"
                color="black"
                className="flex-1 h-11"
                onClick={() => document.getElementById('file-upload').click()}
              >
                {file ? file.name : 'Choose file'}
              </Button>
              <Button
                variant="gradient"
                color="black"
                disabled={!file || uploading}
                onClick={handleUpload}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {uploadError && (
              <Alert color="red" variant="ghost">
                {uploadError}
              </Alert>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Train Model Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white">
        <CardBody className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <CogIcon className="w-8 h-8 text-black" />
            <Typography variant="h4" className="font-bold text-black">
              Train Model
            </Typography>
          </div>
          <div className="space-y-4">
            <Select
              label="Select Dataset"
              value={selectedDataset}
              onChange={(value) => setSelectedDataset(value)}
            >
              {datasets.map((dataset) => (
                <Option key={dataset} value={dataset}>
                  {dataset}
                </Option>
              ))}
            </Select>

            <Select
              label="Select Model"
              value={selectedModel}
              onChange={(value) => handleModelChange({ target: { value } })}
            >
              {availableModels.map((model) => (
                <Option key={model.name} value={model.name}>
                  {model.name.replace(/_/g, ' ').toUpperCase()} - {model.type}
                </Option>
              ))}
            </Select>

            {selectedModel && modelParams && Object.keys(modelParams).length > 0 && (
              <div className="mt-4 p-4 border rounded-lg">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Model Parameters
                </Typography>
                {Object.keys(modelParams).map((param) => (
                  <Input
                    key={param}
                    label={param}
                    name={param}
                    onChange={handleParameterChange}
                    className="mb-3"
                  />
                ))}
              </div>
            )}

            <Button
              variant="gradient"
              color="black"
              className="w-full"
              disabled={!selectedDataset || !selectedModel}
              onClick={handleTrain}
            >
              Train Model
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Training Results Card */}
      {trainingResult && (
        <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white">
          <CardBody className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <BeakerIcon className="w-8 h-8 text-black" />
              <Typography variant="h4" className="font-bold text-black">
                Training Results
              </Typography>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <Typography variant="h6" className="mb-2">
                  Model Information
                </Typography>
                <Typography>Filename: {trainingResult.model_filename}</Typography>
                <Typography>Type: {trainingResult.metrics.model_type}</Typography>
              </div>

              <div className="p-4 border rounded-lg">
                <Typography variant="h6" className="mb-2">
                  Performance Metrics
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography>
                      Training Score: {formatMetricValue(trainingResult.metrics.train_score)}
                    </Typography>
                    <Typography>
                      Test Score: {formatMetricValue(trainingResult.metrics.test_score)}
                    </Typography>
                  </div>
                  <div>
                    {trainingResult.metrics.accuracy && (
                      <Typography>
                        Accuracy: {formatMetricValue(trainingResult.metrics.accuracy)}
                      </Typography>
                    )}
                    {trainingResult.metrics.rmse && (
                      <Typography>
                        RMSE: {formatMetricValue(trainingResult.metrics.rmse)}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Typography variant="h6" className="mb-2">
                  Model Parameters
                </Typography>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(trainingResult.metrics.parameters, null, 2)}
                </pre>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Training;
