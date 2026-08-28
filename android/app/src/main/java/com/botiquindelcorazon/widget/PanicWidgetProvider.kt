package com.botiquindelcorazon.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.botiquindelcorazon.MainActivity
import com.botiquindelcorazon.R

class PanicWidgetProvider : AppWidgetProvider() {

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.panic_widget_layout)

            // Direct 1-tap intent: Opens SOS screen and starts playing calming voice immediately
            val sosIntent = Intent(Intent.ACTION_VIEW, Uri.parse("botiquin://open?view=sos&autoplay=true")).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val sosPendingIntent = PendingIntent.getActivity(
                context,
                2001,
                sosIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            views.setOnClickPendingIntent(R.id.panic_widget_root, sosPendingIntent)
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
}
