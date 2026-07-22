'use client';
import React, { useState } from 'react';
import OrderVolumeChart from './OrderVolumeChart';
import TopProductsChart from './TopProductsChart';

interface OrderDataPoint {
  day: string;
  orders: number;
  revenue: number;
}

interface ProductDataPoint {
  name: string;
  sales: number;
  revenue: number;
}

export default function DashboardCharts() {
  const [selectedOrderData, setSelectedOrderData] = useState<OrderDataPoint | null>(null);
  const [selectedProductData, setSelectedProductData] = useState<ProductDataPoint | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderVolumeChart onDataPointClick={setSelectedOrderData} />
        <TopProductsChart onDataPointClick={setSelectedProductData} />
      </div>

      {/* Order Detail Modal */}
      {selectedOrderData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedOrderData(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-6">{selectedOrderData.day} — Order Details</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Orders</p>
                <p className="text-3xl font-bold text-primary">{selectedOrderData.orders}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-3xl font-bold text-foreground">R {selectedOrderData.revenue}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">
                  R {selectedOrderData.orders > 0 ? (selectedOrderData.revenue / selectedOrderData.orders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
            <button onClick={() => setSelectedOrderData(null)} className="btn-primary w-full text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedProductData(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-6">{selectedProductData.name}</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Units Sold</p>
                <p className="text-3xl font-bold text-primary">{selectedProductData.sales}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-3xl font-bold text-foreground">R {selectedProductData.revenue}</p>
              </div>
            </div>
            <button onClick={() => setSelectedProductData(null)} className="btn-primary w-full text-sm">Close</button>
          </div>
        </div>
      )}
    </>
  );
}