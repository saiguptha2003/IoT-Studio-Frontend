import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Alert, Card, CardBody, CardHeader, CardFooter, Tooltip as MTooltip, IconButton, Menu, MenuHandler, MenuList, MenuItem, Tabs, Tab, TabPanel, Select, Option } from "@material-tailwind/react";
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  PresentationChartLineIcon, 
  TableCellsIcon,
  ArrowPathIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ArrowsPointingOutIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Papa from 'papaparse';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as XLSX from 'xlsx'; // Add this import for Excel support

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  'rgba(255, 99, 132, 0.7)',
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
  'rgba(199, 199, 199, 0.7)',
  'rgba(83, 102, 255, 0.7)',
  'rgba(78, 252, 167, 0.7)',
  'rgba(252, 78, 215, 0.7)',
];

const CHART_BORDER_COLORS = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(199, 199, 199)',
  'rgb(83, 102, 255)',
  'rgb(78, 252, 167)',
  'rgb(252, 78, 215)',
];

// Define widget sizes
const WIDGET_SIZES = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 row-span-2",
};

// Function to format values nicely
const formatValue = (value) => {
  if (typeof value !== 'number') return value;
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else {
    return value.toFixed(2);
  }
};

// Widget component for various chart types
const DashboardWidget = ({ id, type, data, title, columns, index, size, onRemove, onSizeChange, onMoveWidget, isConfiguring, onConfigureWidget, render }) => {
  const ref = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      onMoveWidget(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  const getChartIcon = () => {
    switch(type) {
      case 'line': return <PresentationChartLineIcon className="w-5 h-5 text-blue-900" />;
      case 'bar': return <ChartBarIcon className="w-5 h-5 text-green-500" />;
      case 'pie': 
      case 'doughnut': return <ChartPieIcon className="w-5 h-5 text-purple-500" />;
      case 'table': return <TableCellsIcon className="w-5 h-5 text-orange-500" />;
      case 'summary': return <AdjustmentsHorizontalIcon className="w-5 h-5 text-pink-500" />;
      default: return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'custom':
        return render ? render(data) : <p>Custom widget</p>;
      case 'line':
        return (
          <Line 
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'top' },
                title: { display: false }
              },
              scales: { 
                y: { 
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatValue(value);
                    }
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              },
              elements: {
                line: {
                  tension: 0.2 // Add a slight curve to lines
                },
                point: {
                  radius: 2, // Smaller points
                  hoverRadius: 5
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
        );
      case 'bar':
        return (
          <Bar 
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'top' },
                title: { display: false }
              },
              scales: { 
                y: { 
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatValue(value);
                    }
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              },
              barPercentage: 0.8,
              categoryPercentage: 0.9,
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
        );
      case 'pie':
        return (
          <Pie 
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { position: size === 'small' ? 'bottom' : 'right' },
                title: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.formattedValue;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((context.raw / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        );
      case 'doughnut':
        return (
          <Doughnut 
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: { 
                legend: { position: size === 'small' ? 'bottom' : 'right' },
                title: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.formattedValue;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((context.raw / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        );
      case 'summary':
        return (
          <div className="grid grid-cols-2 gap-4 h-full place-content-center">
            {Object.entries(data).map(([key, value], i) => (
              <div key={i} className="p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-300" 
                style={{
                  background: `linear-gradient(135deg, ${CHART_COLORS[i % CHART_COLORS.length]}, rgba(30, 64, 175, 0.9))`,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
              >
                <p className="text-gray-700 text-sm font-medium mb-1">{key}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto max-h-[300px] styled-scrollbar">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                <tr>
                  {Object.keys(data[0] || {}).map((header, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(0, 100).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-100 transition-colors'}>
                    {Object.values(row).map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-sm text-gray-700 truncate max-w-[150px]">
                        {typeof cell === 'number' ? formatValue(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <p>Invalid chart type</p>;
    }
  };
  
  const heightClass = size === 'large' ? 'h-[600px]' : 'h-[300px]';

  return (
    <div 
      ref={ref} 
      className={`${WIDGET_SIZES[size]} transition-all duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader 
          floated={false}
          shadow={false}
          className="flex items-center justify-between p-3 m-0 bg-white border-b rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <Typography variant="h6" className="font-bold">
              {title}
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <MTooltip content={isConfiguring ? "Hide Configuration" : "Configure Widget"}>
              <IconButton size="sm" variant="text" color="blue-900" 
                onClick={() => onConfigureWidget(id, !isConfiguring)}>
                {isConfiguring ? <EyeIcon className="h-4 w-4" /> : <AdjustmentsHorizontalIcon className="h-4 w-4" />}
              </IconButton>
            </MTooltip>
            
            <Menu open={menuOpen} handler={setMenuOpen} placement="bottom-end">
              <MenuHandler>
                <IconButton variant="text" size="sm">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </IconButton>
              </MenuHandler>
              <MenuList className="min-w-[120px] p-1">
                <MenuItem className="flex items-center gap-2 p-2" onClick={() => onSizeChange(index, size === 'small' ? 'medium' : (size === 'medium' ? 'large' : 'small'))}>
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                  <Typography variant="small">Resize</Typography>
                </MenuItem>
                <MenuItem className="flex items-center gap-2 p-2 text-red-500" onClick={() => onRemove(index)}>
                  <XMarkIcon className="h-4 w-4" />
                  <Typography variant="small">Remove</Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </CardHeader>
        <CardBody className={`p-4 ${heightClass} overflow-hidden`}>
          <div className="h-full w-full">
            {renderChart()}
          </div>
        </CardBody>
        {isConfiguring && (
          <CardFooter className="p-3 bg-blue-900/10 border-t">
            <Typography variant="small" className="text-blue-900">
              Drag to reposition • Click resize to change widget size
            </Typography>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

// Enhanced widget configurator
const WidgetConfigurator = ({ rawData, columns, addWidget }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [widgetTitle, setWidgetTitle] = useState('New Chart');
  const [activeTab, setActiveTab] = useState(0);
  const [chartOptions, setChartOptions] = useState({
    showLegend: true,
    showGrid: true,
    stacked: false,
    fill: false,
    legendPosition: 'top',
    dataLimit: 50
  });
  
  useEffect(() => {
    if (columns.length > 0) {
      // Default to first non-numeric column as x-axis if available
      const nonNumericColumn = columns.find(col => col.type === 'string') || columns[0];
      setXAxisColumn(nonNumericColumn.name);
      
      // Default to first numeric column for data
      const numericColumns = columns.filter(col => col.type === 'number');
      if (numericColumns.length > 0) {
        setSelectedColumns([numericColumns[0].name]);
      }
    }
  }, [columns]);

  const handleAddWidget = () => {
    if (!xAxisColumn || selectedColumns.length === 0) {
      return;
    }

    let chartData;
    const dataLimit = parseInt(chartOptions.dataLimit) || 50;
    const limitedData = rawData.slice(0, dataLimit);
    
    if (chartType === 'summary') {
      // Create enhanced summary metrics
      const summaryData = {};
      selectedColumns.forEach(column => {
        const values = rawData.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
        if (values.length > 0) {
          summaryData[`${column} (Avg)`] = formatValue(values.reduce((a, b) => a + b, 0) / values.length);
          summaryData[`${column} (Max)`] = formatValue(Math.max(...values));
          summaryData[`${column} (Min)`] = formatValue(Math.min(...values));
          summaryData[`${column} (Total)`] = formatValue(values.reduce((a, b) => a + b, 0));
        }
      });
      chartData = summaryData;
    } else if (chartType === 'table') {
      // For table, use a slice of the raw data
      chartData = limitedData;
    } else {
      // For charts (line, bar, pie, doughnut)
      const labels = limitedData.map(row => row[xAxisColumn]);
      
      const datasets = selectedColumns.map((column, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const borderColor = CHART_BORDER_COLORS[index % CHART_BORDER_COLORS.length];
        
        return {
          label: column,
          data: limitedData.map(row => parseFloat(row[column])),
          backgroundColor: ['pie', 'doughnut'].includes(chartType) 
            ? selectedColumns.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
            : chartOptions.fill ? color : color.replace('0.7', '0.2'),
          borderColor: borderColor,
          borderWidth: 1,
          fill: chartOptions.fill,
          tension: 0.2
        };
      });
      
      chartData = { labels, datasets };
    }

    const widgetId = `widget-${Date.now()}`;
    addWidget({
      id: widgetId,
      type: chartType,
      data: chartData,
      title: widgetTitle,
      columns: selectedColumns,
      size: 'small',
      options: chartOptions
    });
  };

  return (
    <Card className="shadow-lg mb-8 overflow-hidden">
      <CardHeader floated={false} shadow={false} className="bg-blue-900/10">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
          <Tab value={0} className="p-3">Basic</Tab>
          <Tab value={1} className="p-3">Advanced</Tab>
          <Tab value={2} className="p-3">Style</Tab>
        </Tabs>
      </CardHeader>
      <CardBody className="p-6">
        <Typography variant="h5" className="mb-4 flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add New Widget
        </Typography>
        
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small" className="font-semibold mb-2">Widget Title</Typography>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter widget title"
              />
            </div>
            
            <div>
              <Typography variant="small" className="font-semibold mb-2">Chart Type</Typography>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'line', icon: <PresentationChartLineIcon className="w-5 h-5" />, label: 'Line' },
                  { value: 'bar', icon: <ChartBarIcon className="w-5 h-5" />, label: 'Bar' },
                  { value: 'pie', icon: <ChartPieIcon className="w-5 h-5" />, label: 'Pie' },
                  { value: 'doughnut', icon: <ChartPieIcon className="w-5 h-5" />, label: 'Doughnut' },
                  { value: 'summary', icon: <AdjustmentsHorizontalIcon className="w-5 h-5" />, label: 'Summary' },
                  { value: 'table', icon: <TableCellsIcon className="w-5 h-5" />, label: 'Table' }
                ].map(chart => (
                  <button
                    key={chart.value}
                    onClick={() => setChartType(chart.value)}
                    className={`p-2 rounded-md border flex flex-col items-center justify-center gap-1 ${
                      chartType === chart.value 
                        ? 'border-blue-900 bg-blue-900/10 text-blue-900' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {chart.icon}
                    <span className="text-xs">{chart.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 0 && chartType !== 'table' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {['line', 'bar'].includes(chartType) && (
              <div>
                <Typography variant="small" className="font-semibold mb-2">X-Axis Column</Typography>
                <select
                  value={xAxisColumn}
                  onChange={(e) => setXAxisColumn(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  {columns.map((column, index) => (
                    <option key={index} value={column.name}>{column.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <Typography variant="small" className="font-semibold mb-2">
                {['pie', 'doughnut'].includes(chartType) ? 'Data Column' : 'Y-Axis Column(s)'}
              </Typography>
              <select
                multiple={!['pie', 'doughnut'].includes(chartType)}
                value={selectedColumns}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedColumns(['pie', 'doughnut'].includes(chartType) ? [selected[0]] : selected);
                }}
                className="w-full border border-gray-300 rounded-md p-2 h-[100px]"
              >
                {columns.filter(col => col.type === 'number').map((column, index) => (
                  <option key={index} value={column.name}>{column.name}</option>
                ))}
              </select>
              <Typography variant="small" color="gray" className="mt-1">
                {!['pie', 'doughnut'].includes(chartType) && "Hold Ctrl/Cmd to select multiple"}
              </Typography>
            </div>
          </div>
        )}
        
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small" className="font-semibold mb-2">Data Limit</Typography>
              <input
                type="number"
                min="1"
                max="1000"
                value={chartOptions.dataLimit}
                onChange={(e) => setChartOptions({...chartOptions, dataLimit: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <Typography variant="small" color="gray" className="mt-1">
                Limit the number of data points (rows) to display
              </Typography>
            </div>
            
            {['line', 'bar'].includes(chartType) && (
              <div>
                <Typography variant="small" className="font-semibold mb-2">Stack Data</Typography>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={chartOptions.stacked}
                      onChange={() => setChartOptions({...chartOptions, stacked: true})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!chartOptions.stacked}
                      onChange={() => setChartOptions({...chartOptions, stacked: false})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>
            )}

            {chartType === 'line' && (
              <div>
                <Typography variant="small" className="font-semibold mb-2">Fill Area Under Line</Typography>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={chartOptions.fill}
                      onChange={() => setChartOptions({...chartOptions, fill: true})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!chartOptions.fill}
                      onChange={() => setChartOptions({...chartOptions, fill: false})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small" className="font-semibold mb-2">Show Legend</Typography>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={chartOptions.showLegend}
                    onChange={() => setChartOptions({...chartOptions, showLegend: true})}
                    className="form-radio h-4 w-4 text-blue-900"
                  />
                  <span className="ml-2 text-sm">Show</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!chartOptions.showLegend}
                    onChange={() => setChartOptions({...chartOptions, showLegend: false})}
                    className="form-radio h-4 w-4 text-blue-900"
                  />
                  <span className="ml-2 text-sm">Hide</span>
                </label>
              </div>
            </div>
            
            <div>
              <Typography variant="small" className="font-semibold mb-2">Legend Position</Typography>
              <select
                value={chartOptions.legendPosition}
                onChange={(e) => setChartOptions({...chartOptions, legendPosition: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2"
                disabled={!chartOptions.showLegend}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            {['line', 'bar'].includes(chartType) && (
              <div>
                <Typography variant="small" className="font-semibold mb-2">Show Grid Lines</Typography>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={chartOptions.showGrid}
                      onChange={() => setChartOptions({...chartOptions, showGrid: true})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">Show</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!chartOptions.showGrid}
                      onChange={() => setChartOptions({...chartOptions, showGrid: false})}
                      className="form-radio h-4 w-4 text-blue-900"
                    />
                    <span className="ml-2 text-sm">Hide</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="gradient" 
            color="blue-900" 
            onClick={handleAddWidget}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" /> Add Widget
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

// Dashboard layout component
const DashboardLayout = ({ children, isConfiguring }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 transition-all duration-300 ${
      isConfiguring ? 'bg-blue-900/10 p-4 rounded-lg border-2 border-dashed border-blue-900' : ''
    }`}>
      {children}
    </div>
  );
};

const BASE_URL = 'http://127.0.0.1:5001';

const Dataview = () => {
  const [fileCategories, setFileCategories] = useState({
    connectFiles: [],
    staticFiles: [],
    triggerFiles: [],
    selfComputeFiles: []
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [error, setError] = useState('');
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configuringWidgetId, setConfiguringWidgetId] = useState(null);
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getHeaders = () => {
    const authToken = localStorage.getItem('authToken');
    return {
      'Authorization': `${authToken}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch available files on component mount
  useEffect(() => {
    fetchDashboardFiles();
  }, []);

  const fetchDashboardFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/services/DataView/dashboards/files`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard files');
      }
      const data = await response.json();
      setFileCategories(data);
    } catch (error) {
      console.error('Error fetching dashboard files:', error);
      setError('Failed to fetch dashboard files: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedFile(null);
    setRawData(null);
    setWidgets([]);
  };

const handleFileSelect = async (file) => {
  setSelectedFile(file);
  setIsLoading(true);
  setError('');

  try {
    // Determine the API endpoint based on file category
    const endpoints = {
      connectFiles: `${BASE_URL}/services/WareHouse/getConnectFile`,
      triggerFiles: `${BASE_URL}/services/WareHouse/getTriggerFile`,
      staticFiles: `${BASE_URL}/services/WareHouse/getStaticFile`,
      selfComputeFiles: `${BASE_URL}/services/WareHouse/getSelfComputeFile`
    };

    const endpoint = `${endpoints[selectedCategory]}/${file.uuid}`;
    const response = await fetch(endpoint, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch file data');
    }

    const blob = await response.blob();
    const contentType = blob.type;
    const fileExtension = file.filename.split('.').pop().toLowerCase();

    // Handle different file types appropriately
    if (contentType.includes('text/csv') || fileExtension === 'csv') {
      // Process CSV files
      const fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(blob);
      });

      console.log("CSV fileData loaded");

      // Parse CSV data
      Papa.parse(fileData, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
            setError('Error parsing CSV file data');
            return;
          }

          const parsedData = results.data.filter(row => {
            return Object.values(row).some(value => value !== null && value !== '');
          });

          if (parsedData.length === 0) {
            setError('No data found in CSV file');
            return;
          }

          setRawData(parsedData);
          setDashboardName(`${file.filename} Dashboard`);

          // Determine column types
          const headers = Object.keys(parsedData[0]);
          const detectedColumns = headers.map(header => {
            const sampleValues = parsedData.slice(0, 10).map(row => row[header]);
            const isNumeric = sampleValues.every(value => 
              typeof value === 'number' || (typeof value === 'string' && !isNaN(value))
            );
            return {
              name: header,
              type: isNumeric ? 'number' : 'string'
            };
          });

          setColumns(detectedColumns);
          createDefaultWidgets(parsedData, detectedColumns);
        }
      });
    } else if (contentType.includes('application/json') || fileExtension === 'json') {
      // Process JSON files
      const fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(blob);
      });

      try {
        const parsedData = JSON.parse(fileData);
        
        // Handle array of objects (most common JSON data format)
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setRawData(parsedData);
          setDashboardName(`${file.filename} Dashboard`);
          
          // Determine column types from the first object
          const headers = Object.keys(parsedData[0]);
          const detectedColumns = headers.map(header => {
            const sampleValues = parsedData.slice(0, 10).map(row => row[header]);
            const isNumeric = sampleValues.every(value => 
              typeof value === 'number' || (typeof value === 'string' && !isNaN(value))
            );
            return {
              name: header,
              type: isNumeric ? 'number' : 'string'
            };
          });
          
          setColumns(detectedColumns);
          createDefaultWidgets(parsedData, detectedColumns);
        } else {
          // Handle object with nested data
          setError('JSON file must contain an array of objects');
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        setError('Failed to parse JSON file');
      }
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls' || 
               contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
               contentType.includes('application/vnd.ms-excel')) {
      // Process Excel files
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (parsedData.length < 2) { // Need at least headers and one row
          setError('Excel file contains insufficient data');
          return;
        }
        
        // Extract headers from first row
        const headers = parsedData[0];
        
        // Convert the remaining rows to an array of objects
        const dataObjects = parsedData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        }).filter(row => Object.values(row).some(val => val !== undefined && val !== null && val !== ''));
        
        if (dataObjects.length === 0) {
          setError('No usable data found in Excel file');
          return;
        }

        setRawData(dataObjects);
        setDashboardName(`${file.filename} Dashboard`);
        
        // Determine column types from data
        const detectedColumns = headers.map(header => {
          const sampleValues = dataObjects.slice(0, 10).map(row => row[header]);
          const isNumeric = sampleValues.every(value => 
            typeof value === 'number' || (typeof value === 'string' && !isNaN(value))
          );
          return {
            name: header,
            type: isNumeric ? 'number' : 'string'
          };
        });
        
        setColumns(detectedColumns);
        createDefaultWidgets(dataObjects, detectedColumns);
      } catch (excelError) {
        console.error('Error parsing Excel file:', excelError);
        setError('Failed to parse Excel file. Error: ' + excelError.message);
      }
    } else {
      // For other file types that we can't visualize, provide a download option
      const url = URL.createObjectURL(blob);
      setError(`The file type '${fileExtension}' cannot be visualized. Use the download button below.`);
      
      // Create a temporary component with the download button
      setWidgets([{
        id: `download-${Date.now()}`,
        type: 'custom',
        title: `Download ${file.filename}`,
        size: 'medium',
        data: { fileUrl: url, fileName: file.filename },
        render: (data) => (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-blue-900 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <p className="text-xl font-semibold text-gray-700">Unable to visualize this file format</p>
              <p className="text-gray-500 mt-2">Click the button below to download the file</p>
            </div>
            <Button 
              color="blue"
              size="lg"
              className="mt-4"
              onClick={() => {
                const a = document.createElement('a');
                a.href = data.fileUrl;
                a.download = data.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download {data.fileName}</span>
              </div>
            </Button>
          </div>
        )
      }]);

      // Make sure to clean up the URL object when component unmounts or changes
      useEffect(() => {
        return () => {
          if (url) URL.revokeObjectURL(url);
        };
      }, [url]);
    }
  } catch (error) {
    console.error('Error loading file:', error);
    setError('Failed to load file: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  const createDefaultWidgets = (parsedData, detectedColumns) => {
    const defaultWidgets = [];
          
    // Line chart widget for first numeric column
    const numericColumns = detectedColumns.filter(col => col.type === 'number');
    const categoryColumn = detectedColumns.find(col => col.type === 'string') || detectedColumns[0];
    
    if (numericColumns.length > 0) {
      // Line chart for time series data
      const lineData = {
        labels: parsedData.slice(0, 50).map(row => row[categoryColumn.name]),
        datasets: [{
          label: numericColumns[0].name,
          data: parsedData.slice(0, 50).map(row => row[numericColumns[0].name]),
          borderColor: CHART_BORDER_COLORS[0],
          backgroundColor: CHART_COLORS[0].replace('0.7', '0.2'),
          borderWidth: 1,
          fill: true
        }]
      };
      
      defaultWidgets.push({
        id: `widget-${Date.now()}`,
        type: 'line',
        data: lineData,
        title: `${numericColumns[0].name} Trend`,
        columns: [numericColumns[0].name],
        size: 'medium'
      });
      
      // Bar chart comparing values
      if (numericColumns.length > 1) {
        const barData = {
          labels: parsedData.slice(0, 10).map(row => row[categoryColumn.name]),
          datasets: [{
            label: numericColumns[1].name,
            data: parsedData.slice(0, 10).map(row => row[numericColumns[1].name]),
            backgroundColor: CHART_COLORS[1],
            borderColor: CHART_BORDER_COLORS[1],
            borderWidth: 1
          }]
        };
        
        defaultWidgets.push({
          id: `widget-${Date.now() + 1}`,
          type: 'bar',
          data: barData,
          title: `Top ${numericColumns[1].name} Values`,
          columns: [numericColumns[1].name],
          size: 'small'
        });
      }
      
      // Pie chart for distribution
      if (numericColumns.length > 2) {
        const pieData = {
          labels: parsedData.slice(0, 6).map(row => row[categoryColumn.name]),
          datasets: [{
            data: parsedData.slice(0, 6).map(row => row[numericColumns[2].name]),
            backgroundColor: CHART_COLORS.slice(0, 6),
            borderColor: CHART_BORDER_COLORS.slice(0, 6),
            borderWidth: 1
          }]
        };
        
        defaultWidgets.push({
          id: `widget-${Date.now() + 2}`,
          type: 'pie',
          data: pieData,
          title: `${numericColumns[2].name} Distribution`,
          columns: [numericColumns[2].name],
          size: 'small'
        });
      }
      
      // Summary metrics
      const summaryData = {};
      numericColumns.slice(0, 3).forEach((column, i) => {
        const values = parsedData.map(row => row[column.name]).filter(val => !isNaN(val));
        if (values.length > 0) {
          summaryData[`${column.name} (Avg)`] = formatValue(values.reduce((a, b) => a + b, 0) / values.length);
          summaryData[`${column.name} (Max)`] = formatValue(Math.max(...values));
          summaryData[`${column.name} (Min)`] = formatValue(Math.min(...values));
          summaryData[`${column.name} (Total)`] = formatValue(values.reduce((a, b) => a + b, 0));
        }
      });
      
      defaultWidgets.push({
        id: `widget-${Date.now() + 3}`,
        type: 'summary',
        data: summaryData,
        title: 'Key Metrics',
        columns: numericColumns.slice(0, 2).map(col => col.name),
        size: 'small'
      });
      
      // Table view of data
      defaultWidgets.push({
        id: `widget-${Date.now() + 4}`,
        type: 'table',
        data: parsedData.slice(0, 100),
        title: 'Data Table',
        columns: detectedColumns.map(col => col.name),
        size: 'medium'
      });
    }
    
    setWidgets(defaultWidgets);
    setIsAddingWidget(false);
    setIsConfiguring(false);
  };

  const handleSaveDashboard = async () => {
    setIsSaving(true);
    try {
      const dashboardConfig = {
        name: dashboardName,
        file: {
          file_id: selectedFile.uuid,
          type_of_file: selectedCategory
        },
        widgets: widgets.map(widget => ({
          id: widget.id,
          type: widget.type,
          title: widget.title,
          columns: widget.columns,
          size: widget.size,
          options: widget.options || {}
        })),
        lastModified: new Date().toISOString()
      };

      const response = await fetch(`${BASE_URL}/api/dashboards`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dashboardConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      // Show success message
      setError('');
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div class="fixed top-4 right-4 z-50">
          <div class="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
            Dashboard saved successfully!
          </div>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (error) {
      console.error('Error saving dashboard:', error);
      setError('Failed to save dashboard: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addWidget = (widget) => {
    setWidgets([...widgets, widget]);
    setIsAddingWidget(false);
  };

  const removeWidget = (index) => {
    const updatedWidgets = [...widgets];
    updatedWidgets.splice(index, 1);
    setWidgets(updatedWidgets);
  };

  const changeWidgetSize = (index, newSize) => {
    const updatedWidgets = [...widgets];
    updatedWidgets[index].size = newSize;
    setWidgets(updatedWidgets);
  };
  
  const moveWidget = (dragIndex, hoverIndex) => {
    const updatedWidgets = [...widgets];
    const dragWidget = updatedWidgets[dragIndex];
    
    // Remove the dragged widget from its original position
    updatedWidgets.splice(dragIndex, 1);
    // Insert the widget at the new position
    updatedWidgets.splice(hoverIndex, 0, dragWidget);
    
    setWidgets(updatedWidgets);
  };

  const resetDashboard = () => {
    setWidgets([]);
    setIsAddingWidget(false);
    setIsConfiguring(false);
    setConfiguringWidgetId(null);
  };
  
  const configureWidget = (widgetId, isConfiguring) => {
    setConfiguringWidgetId(isConfiguring ? widgetId : null);
  };

  const toggleConfigMode = () => {
    setIsConfiguring(!isConfiguring);
    if (isConfiguring) {
      setConfiguringWidgetId(null);
    }
  };

  return (
    <>
      <div className="relative flex h-[40vh] content-center items-center justify-center pt-20"> 
        <div className="absolute top-0 h-full !w-[110vw] bg-[url('/img/background-3.png')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-gradient-to-b from-black to-blue-900/80" />
        <div className="max-w-8xl container relative mx-auto text-center px-4"> 
          <Typography variant="h1" color="white" className="mb-8 font-black text-5xl"> 
            Interactive Data Dashboard
          </Typography>
          <Typography variant="lead" color="white" className="opacity-90 text-xl"> 
            Transform your CSV data into powerful, customizable visualizations
          </Typography>
        </div>
      </div>

      <section className="-mt-5 bg-gray-50 px-4 pb-20">
        <div className="container mx-auto">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 mb-8 overflow-hidden">
            <CardHeader color="blue-900" className="relative h-16 mt-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800"></div>
              <div className="w-full absolute bottom-0 flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2 shadow-md">
                    <PresentationChartLineIcon className="w-5 h-5 text-blue-900" />
                  </div>
                  <input 
                    type="text" 
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    className="bg-transparent border-none font-bold text-white text-xl focus:outline-none focus:ring-0"
                  />
                </div>
                
                {rawData && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="text"
                      color="white"
                      className="flex items-center gap-1"
                      onClick={toggleConfigMode}
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      {isConfiguring ? 'Exit Edit Mode' : 'Edit Layout'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="filled"
                      className="bg-white text-blue-900 shadow-md flex items-center gap-1"
                      onClick={handleSaveDashboard}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                          </svg>
                          <span>Save Dashboard</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Typography variant="small" className="font-semibold mb-2">Select File Category</Typography>
                      <Select
                        value={selectedCategory}
                        onChange={(value) => handleCategoryChange(value)}
                        className="w-full"
                      >
                        {Object.keys(fileCategories).map((category) => (
                          <Option key={category} value={category}>
                            {category.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {selectedCategory && (
                      <div>
                        <Typography variant="small" className="font-semibold mb-2">Select File</Typography>
                        <Select
                          value={selectedFile?.uuid || ''}
                          onChange={(value) => {
                            const file = fileCategories[selectedCategory].find(f => f.uuid === value);
                            handleFileSelect(file);
                          }}
                          className="w-full"
                        >
                          {fileCategories[selectedCategory].map((file) => (
                            <Option key={file.uuid} value={file.uuid}>
                              {file.filename} ({new Date(file.timeStamp).toLocaleDateString()})
                            </Option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    {rawData && (
                      <>
                        {isAddingWidget ? (
                          <Button
                            variant="outlined"
                            color="gray"
                            className="flex items-center gap-2"
                            onClick={() => setIsAddingWidget(false)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="blue-900"
                            className="flex items-center gap-2 shadow-sm"
                            onClick={() => setIsAddingWidget(true)}
                          >
                            <PlusIcon className="h-4 w-4" /> Add Widget
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="red"
                          className="flex items-center gap-2 shadow-sm"
                          onClick={resetDashboard}
                        >
                          <ArrowPathIcon className="h-4 w-4" /> Reset
                        </Button>
                      </>
                    )}
                  </div>

                  {error && (
                    <Alert color="red" className="mb-6 border border-red-100 shadow-sm">
                      {error}
                    </Alert>
                  )}

                  {rawData && isAddingWidget && (
                    <WidgetConfigurator 
                      rawData={rawData}
                      columns={columns}
                      addWidget={addWidget}
                    />
                  )}

                  {widgets.length > 0 ? (
                    <DndProvider backend={HTML5Backend}>
                      <DashboardLayout isConfiguring={isConfiguring}>
                        {widgets.map((widget, index) => (
                          <DashboardWidget
                            key={widget.id || index}
                            id={widget.id || `widget-${index}`}
                            index={index}
                            {...widget}
                            onRemove={removeWidget}
                            onSizeChange={changeWidgetSize}
                            onMoveWidget={moveWidget}
                            isConfiguring={configuringWidgetId === widget.id || isConfiguring}
                            onConfigureWidget={configureWidget}
                          />
                        ))}
                      </DashboardLayout>
                    </DndProvider>
                  ) : (
                    rawData && (
                      <Alert color="blue-900" className="mb-6 border border-blue-900/10 shadow-sm">
                        No widgets added yet. Click "Add Widget" to create your dashboard.
                      </Alert>
                    )
                  )}

                  {!rawData && !error && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="text-center mb-8">
                        <PresentationChartLineIcon className="w-16 h-16 text-blue-900/20 mx-auto mb-4" />
                        <Typography className="text-gray-700 text-xl font-semibold">
                          Select a file category and file to create your dashboard
                        </Typography>
                        <Typography className="text-gray-500 mt-2">
                          Transform your data into interactive visualizations with just a few clicks
                        </Typography>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
            {rawData && (
              <CardFooter className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <Typography variant="small" color="gray" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                    </svg>
                    {rawData.length} rows • {columns.length} columns
                  </Typography>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="text" 
                      size="sm" 
                      color="gray"
                      className="flex items-center gap-1"
                      onClick={() => {
                        setIsAddingWidget(!isAddingWidget);
                      }}
                    >
                      {isAddingWidget ? (
                        <>Cancel</>
                      ) : (
                        <>
                          <PlusIcon className="h-3.5 w-3.5" /> Add Widget
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="text" 
                      size="sm" 
                      color="blue-900"
                      className="flex items-center gap-1"
                      onClick={handleSaveDashboard}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                      </svg>
                      Save Dashboard
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </section>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </>
  );
};

export default Dataview;