package com.muehlingsolutions.educafric;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Force load the web app immediately
        // This prevents any "hello Android" default messages
    }
}
