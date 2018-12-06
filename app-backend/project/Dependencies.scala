import scala.util.Properties

import sbt._

object Dependencies {
  val akka = "com.typesafe.akka" %% "akka-actor" % Version.akka
  val akkaCirceJson = "de.heikoseeberger" %% "akka-http-circe" % Version.akkaCirceJson
  val akkaHttpCors = "ch.megard" %% "akka-http-cors" % Version.akkaHttpCors
  val akkaHttpExtensions = "com.lonelyplanet" %% "akka-http-extensions" % Version.akkaHttpExtensions
  val akkaSlf4j = "com.typesafe.akka" %% "akka-slf4j" % Version.akkaSlf4j
  val akkahttp = "com.typesafe.akka" %% "akka-http" % Version.akkaHttp
  val akkastream = "com.typesafe.akka" %% "akka-stream" % Version.akka
  val akkatestkit = "com.typesafe.akka" %% "akka-http-testkit" % Version.akkaHttp
  val apacheCommonsEmail = "org.apache.commons" % "commons-email" % Version.apacheCommonsEmail
  val auth0 = "com.auth0" % "auth0" % Version.auth0
  val awsBatchSdk = "com.amazonaws" % "aws-java-sdk-batch" % Version.awsBatchSdk
  val awsStsSdk = "com.amazonaws" % "aws-java-sdk-sts" % Version.awsStsSdk
  val betterFiles = "com.github.pathikrit" %% "better-files" % Version.betterFiles
  val caffeine = "com.github.ben-manes.caffeine" % "caffeine" % Version.caffeine
  val catsCore = "org.typelevel" %% "cats-core" % Version.cats
  val catsEffect = "org.typelevel" %% "cats-effect" % Version.catsEffect
  val catsMeow = "com.olegpy" %% "meow-mtl" % Version.catsMeow
  val chill = "com.twitter" %% "chill" % Version.chill
  val circeCore = "io.circe" %% "circe-core" % Version.circe
  val circeGeneric = "io.circe" %% "circe-generic" % Version.circe
  val circeGenericExtras = "io.circe" %% "circe-generic-extras" % Version.circe
  val circeOptics = "io.circe" %% "circe-optics" % Version.circe
  val circeParser = "io.circe" %% "circe-parser" % Version.circe
  val circeTest = "io.circe" %% "circe-testing" % Version.circe % "test"
  val commonsIO = "commons-io" % "commons-io" % Version.commonsIO
  val dnsJava = "dnsjava" % "dnsjava" % Version.dnsJava
  val doobieCore = "org.tpolecat" %% "doobie-core" % Version.doobie
  val doobieHikari = "org.tpolecat" %% "doobie-hikari" % Version.doobie
  val doobiePostgres = "org.tpolecat" %% "doobie-postgres" % Version.doobie
  val doobiePostgresCirce = "org.tpolecat" %% "doobie-postgres-circe" % Version.doobie
  val doobieScalatest = "org.tpolecat" %% "doobie-scalatest" % Version.doobie
  val doobieSpecs = "org.tpolecat" %% "doobie-specs2" % Version.doobie
  val dropbox = "com.dropbox.core" % "dropbox-core-sdk" % Version.dropbox
  val elasticacheClient = "com.amazonaws" % "elasticache-java-cluster-client" % Version.elasticacheClient
  val ficus = "com.iheart" %% "ficus" % Version.ficus
  val findbugAnnotations = "com.google.code.findbugs" % "annotations" % Version.findbugAnnotations % "compile"
  val gatlingApp = "io.gatling" % "gatling-app" % Version.gatling % "test,it"
  val gatlingHighcharts = "io.gatling.highcharts" % "gatling-charts-highcharts" % Version.gatling
  val gatlingTest = "io.gatling" % "gatling-test-framework" % Version.gatling % "test,it"
  val geotools = "org.geotools" % "gt-shapefile" % Version.geotools
  val geotrellisGeotools = "org.locationtech.geotrellis" %% "geotrellis-geotools" % Version.geotrellis
  val geotrellisRaster = "org.locationtech.geotrellis" %% "geotrellis-raster" % Version.geotrellis
  val geotrellisRasterTestkit = "org.locationtech.geotrellis" %% "geotrellis-raster-testkit" % Version.geotrellis
  val geotrellisS3 = "org.locationtech.geotrellis" %% "geotrellis-s3" % Version.geotrellis
  val geotrellisServer = "com.azavea" %% "geotrellis-server-core" % Version.geotrellisServer
  val geotrellisShapefile = "org.locationtech.geotrellis" %% "geotrellis-shapefile" % Version.geotrellis
  val geotrellisSpark = "org.locationtech.geotrellis" %% "geotrellis-spark" % Version.geotrellis
  val geotrellisUtil = "org.locationtech.geotrellis" %% "geotrellis-util" % Version.geotrellis
  val geotrellisVector = "org.locationtech.geotrellis" %% "geotrellis-vector" % Version.geotrellis
  val geotrellisVectorTestkit = "org.locationtech.geotrellis" %% "geotrellis-vector-testkit" % Version.geotrellis % "test"
  val hadoopAws = "org.apache.hadoop" % "hadoop-aws" % Version.hadoop
  val hikariCP = "com.typesafe.slick" %% "slick-hikaricp" % Version.hikariCP
  val http4sBlaze = "org.http4s" %% "http4s-blaze-server" % Version.http4s
  val http4sBlazeClient = "org.http4s" %% "http4s-blaze-client" % Version.http4s
  val http4sCirce = "org.http4s" %% "http4s-circe" % Version.http4s
  val http4sDSL = "org.http4s" %% "http4s-dsl" % Version.http4s
  val http4sServer = "org.http4s" %% "http4s-server" % Version.http4s
  val kamonAkka = "io.kamon" %% "kamon-akka" % Version.kamon
  val kamonAkkaHttp = "io.kamon" %% "kamon-akka-http" % Version.kamonAkkaHttp
  val kamonCore = "io.kamon" %% "kamon-core" % Version.kamon
  val kamonStatsd = "io.kamon" %% "kamon-statsd" % Version.kamon
  val mamlJvm = "com.azavea" %% "maml-jvm" % Version.maml
  val mamlSpark = "com.azavea" %% "maml-spark" % Version.maml
  val nimbusJose = "com.guizmaii" %% "scala-nimbus-jose-jwt" % Version.nimbusJose
  val postgres = "org.postgresql" % "postgresql" % Version.postgres
  val rollbar = "com.rollbar" % "rollbar-java" % Version.rollbar
  val scaffeine = "com.github.blemale" %% "scaffeine" % Version.scaffeine
  val scalaCheck = "org.scalacheck" %% "scalacheck" % Version.scalaCheck % "test"
  val scalaCsv = "com.github.tototoshi" %% "scala-csv" % Version.scalaCsv
  val scalaLogging = "com.typesafe.scala-logging" %% "scala-logging" % Version.scalaLogging
  val scalaforklift = "com.liyaos" %% "scala-forklift-slick" % Version.scalaForklift
  val scalajHttp = "org.scalaj" %% "scalaj-http" % Version.scalajHttp
  val scalatest = "org.scalatest" %% "scalatest" % Version.scalaTest % "test"
  val scopt = "com.github.scopt" %% "scopt" % Version.scopt
  val slickMigrationAPI = "io.github.nafg" %% "slick-migration-api" % Version.slickMigrationAPI
  val spark = "org.apache.spark" %% "spark-core" % Version.spark % "provided"
  val sparkCore = "org.apache.spark" %% "spark-core" % Version.spark
}
