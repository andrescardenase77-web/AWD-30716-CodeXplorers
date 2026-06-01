<?php
session_start();
ini_set('display_errors', 0); 

try {
    require_once '../dbCredentials.php';
    require_once '../models/Patient.php';

    $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';
    $wantsJson = str_contains($acceptHeader, 'application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        header('Content-Type: application/json');
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing patient ID.']);
            exit;
        }

        $patient = Patient::find($id);
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['error' => 'Patient not found.']);
            exit;
        }

        try {
            Patient::destroy($id);
            echo json_encode(['success' => true, 'message' => 'Patient deleted']);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Deletion failed.']);
        }
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $action = $_POST['action'] ?? 'create';

        if ($action === 'delete') {
            $id = $_POST['id'] ?? null;
            if ($id) {
                Patient::destroy($id);
            }
            if ($wantsJson) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Patient deleted']);
            } else {
                header('Location: ../views/php/patient-list.php');
            }
            exit;
        }

        if ($action === 'update') {
            $id = $_POST['id'] ?? null;
            if ($id) {
                $patient = Patient::find($id);
                if ($patient) {
                    unset($_POST['action']);
                    unset($_POST['id']);
                    $patient->fill($_POST);

                    if (!$patient->validateData() || !$patient->isValidName() ||
                        !$patient->isValidPhone() || !$patient->isValidBirthday() ||
                        !$patient->isValidGender() || !$patient->isValidReasonForConsultation()) {
                        if ($wantsJson) {
                            http_response_code(400);
                            header('Content-Type: application/json');
                            echo json_encode(['error' => 'Invalid patient data.']);
                        } else {
                            header('Location: ../views/php/error.php?type=patient');
                        }
                        exit;
                    }

                    if ($patient->requiresLegalRepresentative()) {
                        if ($wantsJson) {
                            http_response_code(400);
                            header('Content-Type: application/json');
                            echo json_encode(['error' => 'Legal representative is required.']);
                        } else {
                            header('Location: ../views/php/error.php?type=patient');
                        }
                        exit;
                    }

                    $patient->save();
                }
            }

            if ($wantsJson) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Patient updated']);
            } else {
                header('Location: ../views/php/patient-list.php');
            }
            exit;
        }

        if ($action === 'create') {
            $patient = new Patient($_POST);
            
            if (!$patient->validateData() || !$patient->isValidName() ||
                !$patient->isValidPhone() || !$patient->isValidBirthday() ||
                !$patient->isValidGender() || !$patient->isValidReasonForConsultation()) {
                if ($wantsJson) {
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Missing required fields.']);
                } else {
                    header('Location: ../views/php/error.php?type=patient');
                }
                exit;
            }

            if ($patient->requiresLegalRepresentative()) {
                if ($wantsJson) {
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Missing required fields.']);
                } else {
                    header('Location: ../views/php/error.php?type=patient');
                }
                exit;
            }

            if ($patient->save()) {
                if ($wantsJson) {
                    http_response_code(201);
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Patient registered successfully']);
                } else {
                    header('Location: ../views/php/success.php?type=patient');
                }
            } else {
                if ($wantsJson) {
                    http_response_code(500);
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Something went wrong. Please try again later.']);
                } else {
                    header('Location: ../views/php/error.php?type=patient');
                }
            }
            exit;
        }
        
    } else {
        header('Location: ../views/php/patient-list.php');
        exit;
    }

} catch (Throwable $e) {
    header('Location: ../views/php/error.php?type=patient');
    exit;
}
