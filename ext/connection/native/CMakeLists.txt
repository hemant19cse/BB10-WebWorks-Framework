cmake_minimum_required(VERSION 2.8)

if (CMAKE_COMPILER_IS_GNUCC)
    set(CMAKE_CXX_FLAGS "-fexceptions -fPIC ${CMAKE_CXX_FLAGS}")
    set(CMAKE_C_FLAGS "-fPIC ${CMAKE_C_FLAGS}")
endif ()

include_directories(${CMAKE_SOURCE_DIR})
include_directories(${CMAKE_SOURCE_DIR}/dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common)

set(connection_srcs
    connection_bps.cpp
    connection_js.cpp
    ../../../dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common/plugin.cpp
)

add_library(netstatus MODULE ${connection_srcs})
target_link_libraries(netstatus bps)
set_target_properties(netstatus PROPERTIES PREFIX "")

install(TARGETS netstatus LIBRARY DESTINATION ".")

