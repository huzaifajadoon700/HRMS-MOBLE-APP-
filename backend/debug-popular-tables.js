#!/usr/bin/env node
/**
 * Debug Popular Tables API
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';

async function debugPopularTables() {
    console.log('🔍 DEBUGGING POPULAR TABLES API');
    
    try {
        console.log('Making request to:', `${BACKEND_URL}/api/tables/popular?limit=5`);
        
        const response = await axios.get(`${BACKEND_URL}/api/tables/popular?limit=5`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('✅ API call successful');
            console.log('Tables field exists:', !!response.data.tables);
            console.log('PopularTables field exists:', !!response.data.popularTables);
            
            if (response.data.tables) {
                console.log('Tables length:', response.data.tables.length);
            }
            if (response.data.popularTables) {
                console.log('PopularTables length:', response.data.popularTables.length);
            }
        } else {
            console.log('❌ API call failed');
            console.log('Error message:', response.data.message);
        }
        
    } catch (error) {
        console.log('❌ Request failed');
        console.log('Error message:', error.message);
        
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugPopularTables();
