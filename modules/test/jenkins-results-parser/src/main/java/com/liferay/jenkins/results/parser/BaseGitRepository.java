/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.jenkins.results.parser;

import java.io.File;

import org.json.JSONObject;

/**
 * @author Peter Yoo
 */
public abstract class BaseGitRepository implements GitRepository {

	@Override
	public String getName() {
		return getString("name");
	}

	protected BaseGitRepository(String name) {
		if ((name == null) || name.isEmpty()) {
			throw new IllegalArgumentException("Name is null");
		}

		put("name", name);

		validateJSONObject(_REQUIRED_KEYS);
	}

	protected Object get(String key) {
		return _jsonObject.opt(key);
	}

	protected File getFile(String key) {
		return new File(getString(key));
	}

	protected String getString(String key) {
		return (String)get(key);
	}

	protected void put(String key, Object o) {
		if (_jsonObject.has(key)) {
			throw new RuntimeException("JSON object already contains " + key);
		}

		_jsonObject.put(key, o);
	}

	protected void validateJSONObject(String[] requiredKeys) {
		for (String requiredKey : requiredKeys) {
			if (!_jsonObject.has(requiredKey)) {
				throw new RuntimeException("Missing " + requiredKey);
			}
		}
	}

	private static final String[] _REQUIRED_KEYS = {"name"};

	private final JSONObject _jsonObject = new JSONObject();

}