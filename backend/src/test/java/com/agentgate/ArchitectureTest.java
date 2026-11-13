package com.agentgate;

import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** C6: architecture rules. Written offline; NOT YET RUN (see traceability matrix). */
@AnalyzeClasses(packages = "com.agentgate", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule no_cycles_between_modules =
            slices().matching("com.agentgate.(*)..").should().beFreeOfCycles();

    @ArchTest
    static final ArchRule common_depends_on_no_module =
            noClasses().that().resideInAPackage("..common..")
                    .should().dependOnClassesThat().resideInAnyPackage(
                            "..identity..", "..registry..", "..gateway..", "..policy..", "..approval..",
                            "..guard..", "..limiter..", "..audit..", "..admin..", "..health..", "..notification..");

    @ArchTest
    static final ArchRule controllers_do_not_touch_repositories =
            noClasses().that().resideInAPackage("..presentation..")
                    .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

    @ArchTest
    static final ArchRule domain_is_framework_light =
            noClasses().that().resideInAPackage("..domain..")
                    .should().dependOnClassesThat().resideInAPackage("..presentation..");

    /** FR9: the playground must never be able to execute a downstream tool. */
    @ArchTest
    static final ArchRule policy_never_depends_on_gateway_executor =
            noClasses().that().resideInAPackage("..policy..")
                    .should().dependOnClassesThat().resideInAPackage("..gateway..");
}
