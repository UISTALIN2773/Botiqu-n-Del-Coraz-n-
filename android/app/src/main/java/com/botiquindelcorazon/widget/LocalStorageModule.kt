package com.botiquindelcorazon.widget

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocalStorageModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_DATA = "BotiquinPermanentData"
    }

    override fun getName(): String = "LocalStorageModule"

    @ReactMethod
    fun saveData(key: String, value: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_DATA, Context.MODE_PRIVATE)
            prefs.edit().putString(key, value).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SAVE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun loadData(key: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_DATA, Context.MODE_PRIVATE)
            val data = prefs.getString(key, null)
            promise.resolve(data)
        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun closePopupToHome(promise: Promise) {
        try {
            currentActivity?.moveTaskToBack(true)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLOSE_ERROR", e.message, e)
        }
    }
}
