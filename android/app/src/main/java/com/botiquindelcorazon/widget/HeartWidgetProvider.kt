package com.botiquindelcorazon.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.botiquindelcorazon.MainActivity
import com.botiquindelcorazon.R

class HeartWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "BotiquinWidgetPrefs"
        const val KEY_QUOTE = "widget_quote"
        const val KEY_AUTHOR = "widget_author"
        const val KEY_MOOD = "widget_mood"
        const val ACTION_REFRESH = "com.botiquindelcorazon.ACTION_REFRESH_QUOTE"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val quote = prefs.getString(KEY_QUOTE, "Tócame si me extrañas o tienes ansiedad.")
            val author = prefs.getString(KEY_AUTHOR, "Mi Amor • Siempre contigo ❤️")
            val mood = prefs.getString(KEY_MOOD, "ansiedad")

            val views = RemoteViews(context.packageName, R.layout.heart_widget_layout)
            views.setTextViewText(R.id.widget_quote_text, quote)
            views.setTextViewText(R.id.widget_author_text, author)

            // Intent 1: Tap anywhere -> Opens Floating Quick Popup Modal
            val popupIntent = Intent(Intent.ACTION_VIEW, Uri.parse("botiquin://open?mood=$mood")).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val popupPendingIntent = PendingIntent.getActivity(
                context,
                1001,
                popupIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Intent 2: Tap Direct Play Button -> Opens and starts playing Voice Note immediately
            val playIntent = Intent(Intent.ACTION_VIEW, Uri.parse("botiquin://open?mood=$mood&autoplay=true")).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val playPendingIntent = PendingIntent.getActivity(
                context,
                1002,
                playIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            views.setOnClickPendingIntent(R.id.widget_root, popupPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_photo, popupPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_heart_icon, popupPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_play_btn, playPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH || intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, HeartWidgetProvider::class.java)
            )
            for (id in ids) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }
}
