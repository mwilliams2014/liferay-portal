package com.liferay.docs.myeditoraddition.portlet;

import com.liferay.docs.myeditoraddition.constants.MyEditorContributorPortletKeys;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.portlet.PortletURL;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;


import com.liferay.portal.kernel.editor.configuration.BaseEditorConfigContributor;
import com.liferay.portal.kernel.editor.configuration.EditorConfigContributor;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.portlet.RequestBackedPortletURLFactory;
import com.liferay.portal.kernel.theme.PortletDisplay;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;

import java.util.Map;
import java.util.Objects;

/**
 * @author liferay
 */
@Component(
	immediate = true,
	property = {
		"editor.config.key=contentEditor",
		"editor.name=alloyeditor",
		"editor.name=ckeditor",
		"javax.portlet.name=com_liferay_blogs_web_portlet_BlogsPortlet",
		"javax.portlet.name=com_liferay_blogs_web_portlet_BlogsAdminPortlet",
		"service.ranking:Integer=100"
	},
	service = EditorConfigContributor.class
)
public class MyEditorContributorPortlet extends BaseEditorConfigContributor {
	/*@Override
public void populateConfigJSONObject(
    JSONObject jsonObject, Map<String, Object> inputEditorTaglibAttributes,
    ThemeDisplay themeDisplay,
    RequestBackedPortletURLFactory requestBackedPortletURLFactory) {
			
			JSONObject toolbars = jsonObject.getJSONObject("toolbars");
			
			if (toolbars != null) {
    JSONObject toolbarAdd = toolbars.getJSONObject("add");

    if (toolbarAdd != null) {
        JSONArray addButtons = toolbarAdd.getJSONArray("buttons");

        addButtons.put("camera");
    }
}

}*/
	@Override
	public void populateConfigJSONObject(
					JSONObject jsonObject, Map<String, Object> inputEditorTaglibAttributes,
					ThemeDisplay themeDisplay,
					RequestBackedPortletURLFactory requestBackedPortletURLFactory) {

						String extraPlugins = jsonObject.getString("extraPlugins");
				
						extraPlugins = extraPlugins.concat(",ae_richcombobridge,ae_uibridge,ae_buttonbridge,richcombo,font");

					JSONObject toolbarsJSONObject = jsonObject.getJSONObject("toolbars");

					if (toolbarsJSONObject == null) {
									toolbarsJSONObject = JSONFactoryUtil.createJSONObject();
					}

					JSONObject stylesJSONObject = toolbarsJSONObject.getJSONObject(
									"styles");

					if (stylesJSONObject == null) {
									stylesJSONObject = JSONFactoryUtil.createJSONObject();
					}

					JSONArray selectionsJSONArray = stylesJSONObject.getJSONArray(
									"selections");
					for (int i = 0; i < selectionsJSONArray.length(); i++) {
									JSONObject selection = selectionsJSONArray.getJSONObject(i);

									if (Objects.equals(selection.get("name"), "text")) {
													JSONArray buttons = selection.getJSONArray("buttons");

													buttons.put("font");
													buttons.put("richcombo");
									}
					}

					stylesJSONObject.put("selections", selectionsJSONArray);

					toolbarsJSONObject.put("styles", stylesJSONObject);

					jsonObject.put("toolbars", toolbarsJSONObject);
	}
}
	
/*		@Override
		public void populateConfigJSONObject(
		    JSONObject jsonObject, Map<String, Object> inputEditorTaglibAttributes,
		    ThemeDisplay themeDisplay,
		    RequestBackedPortletURLFactory requestBackedPortletURLFactory) {
				
					//JSONObject toolbars = jsonObject.getJSONObject("toolbars");
					String extraPlugins = jsonObject.getString("extraPlugins");
			
					extraPlugins = extraPlugins.concat("ae_uibridge,ae_richcombobridge,font");
					//extraPlugins = extraPlugins.concat(",ae_autolink,ae_addimages,ae_dragresize,ae_placeholder");
			
					JSONObject toolbarsJSONObject = jsonObject.getJSONObject("toolbars");

					if (toolbarsJSONObject == null) {
									toolbarsJSONObject = JSONFactoryUtil.createJSONObject();
					}

					JSONObject stylesJSONObject = toolbarsJSONObject.getJSONObject(
									"styles");

					if (stylesJSONObject == null) {
									stylesJSONObject = JSONFactoryUtil.createJSONObject();
					}

					JSONArray selectionsJSONArray = stylesJSONObject.getJSONArray(
									"selections");

					for (int i = 0; i < selectionsJSONArray.length(); i++) {
									JSONObject selection = selectionsJSONArray.getJSONObject(i);

									if (Objects.equals(selection.get("name"), "text")) {
													JSONArray buttons = selection.getJSONArray("buttons");

													buttons.put("Font");
									}
					}

					stylesJSONObject.put("selections", selectionsJSONArray);

					toolbarsJSONObject.put("styles", stylesJSONObject);

					jsonObject.put("toolbars", toolbarsJSONObject);
					
		}*/

	
//}