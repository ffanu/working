"use client";

import { Button } from "./button";

export function PrintTest() {
  const testPrint = () => {
    console.log('Testing print functionality...');
    
    // Test 1: Check if window.print exists
    if (typeof window.print === 'function') {
      console.log('✓ window.print is available');
    } else {
      console.log('✗ window.print is not available');
      return;
    }
    
    // Test 2: Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('✓ Running in browser environment');
    } else {
      console.log('✗ Not running in browser environment');
      return;
    }
    
    // Test 3: Try to trigger print
    try {
      console.log('Attempting to trigger print...');
      window.print();
      console.log('✓ Print triggered successfully');
    } catch (error) {
      console.error('✗ Print failed:', error);
    }
  };

  const testPrintStyles = () => {
    console.log('Testing print styles...');
    
    // Check if print media query is working
    const mediaQuery = window.matchMedia('print');
    console.log('Print media query matches:', mediaQuery.matches);
    
    // Check if we can detect print mode
    mediaQuery.addListener((e) => {
      console.log('Print mode changed:', e.matches);
    });
    
    // Test CSS custom properties
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    console.log('CSS custom properties available:', computedStyle.getPropertyValue('--background'));
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Print Functionality Test</h3>
      <div className="space-y-2">
        <Button onClick={testPrint} className="w-full">
          Test Print Function
        </Button>
        <Button onClick={testPrintStyles} variant="outline" className="w-full">
          Test Print Styles
        </Button>
        <div className="text-xs text-gray-600 mt-2">
          Check browser console for test results
        </div>
      </div>
    </div>
  );
}
