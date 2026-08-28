package com.botiquindelcorazon.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HeartWidgetModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "HeartWidgetModule"

    @ReactMethod
    fun updateWidgetData(quote: String, author: String, mood: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(
                HeartWidgetProvider.PREFS_NAME,
                Context.MODE_PRIVATE
            )
            prefs.edit().apply {
                putString(HeartWidgetProvider.KEY_QUOTE, quote)
                putString(HeartWidgetProvider.KEY_AUTHOR, author)
                putString(HeartWidgetProvider.KEY_MOOD, mood)
                apply()
            }

            // Notify Widget Manager to refresh UI immediately
            val intent = Intent(reactContext, HeartWidgetProvider::class.java).apply {
                action = HeartWidgetProvider.ACTION_REFRESH
            }
            reactContext.sendBroadcast(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_UPDATE_ERROR", e.message, e)
        }
    }
}
