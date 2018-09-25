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
import java.io.IOException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

/**
 * @author Michael Hashimoto
 */
public abstract class TopLevelBuildRunner<T extends TopLevelBuildData>
	extends BaseBuildRunner<T> {

	@Override
	public void run() {
		super.run();

		propagateDistFilesToDistNodes();

		invokeBatchJobs();

		waitForInvokedJobs();
	}

	protected TopLevelBuildRunner(T topLevelBuildData) {
		super(topLevelBuildData);

		Build build = BuildFactory.newBuild(
			topLevelBuildData.getBuildURL(), null);

		if (!(build instanceof TopLevelBuild)) {
			throw new RuntimeException(
				"Invalid build URL " + topLevelBuildData.getBuildURL());
		}

		_topLevelBuild = (TopLevelBuild)build;
	}

	protected Set<String> getBatchNames() {
		Job job = getJob();

		return job.getBatchNames();
	}

	protected String[] getDistFileNames() {
		return new String[] {BuildData.JENKINS_BUILD_DATA_FILE_NAME};
	}

	protected void invokeBatchJob(String batchName) {
		BuildData buildData = getBuildData();

		Map<String, String> invocationParameters = new HashMap<>();

		invocationParameters.put("BATCH_NAME", batchName);
		invocationParameters.put(
			"DIST_NODES", StringUtils.join(buildData.getDistNodes(), ","));
		invocationParameters.put("DIST_PATH", buildData.getDistPath());
		invocationParameters.put("JENKINS_GITHUB_URL", _getJenkinsGitHubURL());
		invocationParameters.put(
			"RUN_ID",
			"batch_" + JenkinsResultsParserUtil.getDistinctTimeStamp());
		invocationParameters.put("TOP_LEVEL_RUN_ID", buildData.getRunID());

		invokeJob(
			buildData.getCohortName(), buildData.getJobName() + "-batch",
			invocationParameters);
	}

	protected void invokeBatchJobs() {
		for (String batchName : getBatchNames()) {
			invokeBatchJob(batchName);
		}
	}

	protected void invokeJob(
		String cohortName, String jobName,
		Map<String, String> invocationParameters) {

		Properties buildProperties;

		try {
			buildProperties = JenkinsResultsParserUtil.getBuildProperties();
		}
		catch (IOException ioe) {
			throw new RuntimeException(ioe);
		}

		List<JenkinsMaster> jenkinsMasters =
			JenkinsResultsParserUtil.getJenkinsMasters(
				buildProperties, cohortName);

		String randomJenkinsURL =
			JenkinsResultsParserUtil.getMostAvailableMasterURL(
				"http://" + cohortName + ".liferay.com", jenkinsMasters.size());

		StringBuilder sb = new StringBuilder();

		sb.append(randomJenkinsURL);
		sb.append("/job/");
		sb.append(jobName);
		sb.append("/buildWithParameters?token=");
		sb.append(buildProperties.getProperty("jenkins.authentication.token"));

		for (Map.Entry<String, String> invocationParameter :
				invocationParameters.entrySet()) {

			sb.append("&");
			sb.append(
				JenkinsResultsParserUtil.fixURL(invocationParameter.getKey()));
			sb.append("=");
			sb.append(
				JenkinsResultsParserUtil.fixURL(
					invocationParameter.getValue()));
		}

		_topLevelBuild.addDownstreamBuilds(sb.toString());

		try {
			JenkinsResultsParserUtil.toString(sb.toString());
		}
		catch (IOException ioe) {
			throw new RuntimeException(ioe);
		}
	}

	protected void propagateDistFilesToDistNodes() {
		if (!JenkinsResultsParserUtil.isCINode()) {
			return;
		}

		writeJenkinsJSONObjectToFile();

		BuildData buildData = getBuildData();

		File workspaceDir = buildData.getWorkspaceDir();

		FilePropagator filePropagator = new FilePropagator(
			getDistFileNames(),
			JenkinsResultsParserUtil.combine(
				buildData.getHostname(), ":", workspaceDir.toString()),
			buildData.getDistPath(), buildData.getDistNodes());

		filePropagator.setCleanUpCommand(_FILE_PROPAGATOR_CLEAN_UP_COMMAND);

		filePropagator.start(_FILE_PROPAGATOR_THREAD_COUNT);
	}

	protected void waitForInvokedJobs() {
		while (true) {
			_topLevelBuild.update();

			System.out.println(_topLevelBuild.getStatusSummary());

			int completed = _topLevelBuild.getDownstreamBuildCount("completed");
			int total = _topLevelBuild.getDownstreamBuildCount(null);

			if (completed >= total) {
				break;
			}

			JenkinsResultsParserUtil.sleep(
				_WAIT_FOR_INVOKED_JOB_DURATION * 1000);
		}
	}

	private String _getJenkinsGitHubURL() {
		if (JenkinsResultsParserUtil.isCINode()) {
			WorkspaceGitRepository jenkinsWorkspaceGitRepository =
				workspace.getJenkinsWorkspaceGitRepository();

			String gitHubDevBranchName =
				jenkinsWorkspaceGitRepository.getGitHubDevBranchName();

			if (gitHubDevBranchName != null) {
				return JenkinsResultsParserUtil.combine(
					"https://github-dev.liferay.com/liferay/",
					"liferay-jenkins-ee/tree/", gitHubDevBranchName);
			}
		}

		BuildData buildData = getBuildData();

		return buildData.getJenkinsGitHubURL();
	}

	private static final String _FILE_PROPAGATOR_CLEAN_UP_COMMAND =
		JenkinsResultsParserUtil.combine(
			"find ", BuildData.DIST_ROOT_PATH,
			"/*/* -maxdepth 1 -type d -mmin +",
			String.valueOf(TopLevelBuildRunner._FILE_PROPAGATOR_EXPIRATION),
			" -exec rm -frv {} \\;");

	private static final int _FILE_PROPAGATOR_EXPIRATION = 180;

	private static final int _FILE_PROPAGATOR_THREAD_COUNT = 1;

	private static final int _WAIT_FOR_INVOKED_JOB_DURATION = 30;

	private final TopLevelBuild _topLevelBuild;

}