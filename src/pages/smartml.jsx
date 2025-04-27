import React, { useState } from 'react';
import { Typography, Tabs, TabsHeader, Tab } from "@material-tailwind/react";
import { BeakerIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import Training from '../components/ml/Training';
import Prediction from '../components/ml/Prediction';

const Smartml = () => {
  const [activeTab, setActiveTab] = useState("training");

  return (
    <>
      <div className="relative flex h-[40vh] content-center items-center justify-center pt-20">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.png')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto text-center px-4">
          <Typography variant="h1" color="white" className="mb-8 font-black text-5xl">
            Smart ML
          </Typography>
          <Typography variant="lead" color="white" className="opacity-80 mb-6 text-xl pb-12">
            Train and deploy machine learning models with ease
          </Typography>
        </div>
      </div>

      <section className="-mt-20 bg-white px-4 pb-20 pt-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} className="mb-8">
            <TabsHeader className="bg-transparent">
              <Tab 
                value="training"
                onClick={() => setActiveTab("training")}
                className={activeTab === "training" ? "text-gray-900" : "text-white"}
              >
                <div className="flex items-center gap-2">
                  <BeakerIcon className="w-5 h-8" />
                  Training
                </div>
              </Tab>
              <Tab
                value="prediction"
                onClick={() => setActiveTab("prediction")}
                className={activeTab === "prediction" ? "text-gray-900" : "text-white"}
              >
                <div className="flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-8" />
                  Prediction
                </div>
              </Tab>
            </TabsHeader>
          </Tabs>

          <div className="mt-8">
            {activeTab === "training" ? <Training /> : <Prediction />}
          </div>
        </div>
      </section>
    </>
  );
};

export default Smartml;